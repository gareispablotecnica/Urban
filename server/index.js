import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import path from "path";
import { products, HERO_IMAGE } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new (sqlite3.verbose().Database)(path.join(__dirname, "store.db"));

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

const app = express();
app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 4000;
init().then(() =>
  app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}`))
);
