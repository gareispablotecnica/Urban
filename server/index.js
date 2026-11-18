import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { products, HERO_IMAGE } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// En Vercel el disco es de solo lectura salvo /tmp (se borra cuando la función se reinicia)
const DB_FILE = process.env.VERCEL ? "/tmp/store.db" : path.join(__dirname, "store.db");
const db = new (sqlite3.verbose().Database)(DB_FILE);

// Promesas sobre sqlite3
const run = (sql, p = []) =>
  new Promise((res, rej) => db.run(sql, p, function (e) { e ? rej(e) : res(this); }));
const all = (sql, p = []) =>
  new Promise((res, rej) => db.all(sql, p, (e, rows) => (e ? rej(e) : res(rows))));
const get = (sql, p = []) =>
  new Promise((res, rej) => db.get(sql, p, (e, row) => (e ? rej(e) : res(row))));

const shape = (r) => ({ ...r, sizes: r.sizes ? r.sizes.split(",") : [], on_sale: !!r.old_price });

async function init() {
  await run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    old_price INTEGER,
    color TEXT,
    sizes TEXT,
    tag TEXT,
    image TEXT
  )`);
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  const { n } = await get("SELECT COUNT(*) AS n FROM products");
  if (n === 0) {
    for (const p of products) {
      await run(
        `INSERT INTO products (name,category,price,old_price,color,sizes,tag,image) VALUES (?,?,?,?,?,?,?,?)`,
        [p.name, p.category, p.price, p.old_price, p.color, p.sizes, p.tag, p.image]
      );
    }
    console.log(`Base cargada con ${products.length} productos`);
  }
}

// Se inicia una sola vez; cada pedido espera a que la base esté lista
const ready = init();
ready.catch((e) => console.error("Error al iniciar la base:", e));

const app = express();
app.use(cors());
app.use(express.json());
app.use(async (_req, _res, next) => {
  try { await ready; next(); } catch (e) { next(e); }
});
// Vercel puede entregar la ruta con o sin "/api": se normaliza para que siempre lo tenga
app.use((req, _res, next) => {
  if (!req.url.startsWith("/api")) req.url = "/api" + req.url;
  next();
});

app.get("/api/config", (_req, res) => res.json({ heroImage: HERO_IMAGE }));

// Listado con filtros: category, size, color, min, max, q, sale, sort
app.get("/api/products", async (req, res) => {
  try {
    const { category, size, color, min, max, q, sale, sort, limit } = req.query;
    const where = [];
    const params = [];

    const list = (v) => String(v).split(",").filter(Boolean);

    if (category) {
      const c = list(category);
      where.push(`category IN (${c.map(() => "?").join(",")})`);
      params.push(...c);
    }
    if (color) {
      const c = list(color);
      where.push(`color IN (${c.map(() => "?").join(",")})`);
      params.push(...c);
    }
    if (size) {
      const s = list(size);
      where.push("(" + s.map(() => `(',' || sizes || ',') LIKE ?`).join(" OR ") + ")");
      params.push(...s.map((x) => `%,${x},%`));
    }
    if (min) { where.push("price >= ?"); params.push(Number(min)); }
    if (max) { where.push("price <= ?"); params.push(Number(max)); }
    if (q) { where.push("name LIKE ?"); params.push(`%${q}%`); }
    if (sale === "1") where.push("old_price IS NOT NULL");

    const orders = {
      price_asc: "price ASC",
      price_desc: "price DESC",
      name: "name ASC",
      new: "id DESC",
    };
    let sql = "SELECT * FROM products";
    if (where.length) sql += " WHERE " + where.join(" AND ");
    sql += " ORDER BY " + (orders[sort] || "id ASC");
    if (limit) { sql += " LIMIT ?"; params.push(Number(limit)); }

    const rows = await all(sql, params);
    res.json(rows.map(shape));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// Valores disponibles para armar los filtros
app.get("/api/filters", async (_req, res) => {
  try {
    const rows = await all("SELECT category, color, sizes, price FROM products");
    const uniq = (a) => [...new Set(a)].filter(Boolean);
    const sizeOrder = ["S", "M", "L", "XL", "39", "40", "41", "42", "43", "44", "U"];
    const sizes = uniq(rows.flatMap((r) => r.sizes.split(","))).sort(
      (a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b)
    );
    const counts = {};
    rows.forEach((r) => (counts[r.category] = (counts[r.category] || 0) + 1));
    const prices = rows.map((r) => r.price);
    res.json({
      categories: uniq(rows.map((r) => r.category)).map((c) => ({ name: c, count: counts[c] })),
      colors: uniq(rows.map((r) => r.color)),
      sizes,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    });
  } catch (e) {
    res.status(500).json({ error: "Error al obtener filtros" });
  }
});


// ───────────── Autenticación ─────────────
// En producción definí JWT_SECRET como variable de entorno.
const JWT_SECRET = process.env.JWT_SECRET || (process.env.VERCEL ? "" : "dev-secret-cambiar-en-produccion");
if (!JWT_SECRET) throw new Error("Falta la variable de entorno JWT_SECRET (Vercel > Settings > Environment Variables).");
const TOKEN_TTL = "7d";

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, created_at: u.created_at });
const signToken = (u) => jwt.sign({ sub: u.id }, JWT_SECRET, { expiresIn: TOKEN_TTL });

// Middleware: exige "Authorization: Bearer <token>"
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Necesitás iniciar sesión." });
  try {
    const { sub } = jwt.verify(token, JWT_SECRET);
    const user = await get("SELECT * FROM users WHERE id = ?", [sub]);
    if (!user) return res.status(401).json({ error: "Tu sesión ya no es válida." });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Tu sesión venció. Ingresá de nuevo." });
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post("/api/auth/register", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (name.length < 2) return res.status(400).json({ error: "Ingresá tu nombre." });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Ingresá un email válido." });
    if (password.length < 6) return res.status(400).json({ error: "La contraseña necesita al menos 6 caracteres." });

    const exists = await get("SELECT id FROM users WHERE email = ?", [email]);
    if (exists) return res.status(409).json({ error: "Ya existe una cuenta con ese email." });

    const hash = await bcrypt.hash(password, 10);
    const { lastID } = await run("INSERT INTO users (name, email, password_hash) VALUES (?,?,?)", [name, email, hash]);
    const user = await get("SELECT * FROM users WHERE id = ?", [lastID]);
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "No pudimos crear la cuenta. Probá de nuevo." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const user = await get("SELECT * FROM users WHERE email = ?", [email]);
    // Mismo mensaje si falla el email o la contraseña: no revela qué cuentas existen
    const ok = user && (await bcrypt.compare(password, user.password_hash));
    if (!ok) return res.status(401).json({ error: "Email o contraseña incorrectos." });
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "No pudimos iniciar sesión. Probá de nuevo." });
  }
});

app.get("/api/auth/me", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

// En tu compu escucha en un puerto; en Vercel se exporta la app y Vercel la ejecuta
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4000;
  ready.then(() => app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}`)));
}

export default app;
