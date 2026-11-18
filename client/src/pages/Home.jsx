import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";

const CATS = [
  { key: "hoodies", label: "Hoodies", cls: "c1" },
  { key: "pantalones", label: "Pantalones", cls: "c2" },
  { key: "camperas", label: "Camperas", cls: "c3" },
  { key: "zapatillas", label: "Zapatillas", cls: "c4" },
];

const WORDS = ["STREETWEAR", "OVERSIZED", "LIMITED DROPS", "NO RULES", "CARGO", "BAGGY FIT", "DESDE LA CALLE"];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [hero, setHero] = useState("");

  useEffect(() => {
    fetch("/api/products?sort=new&limit=4").then((r) => r.json()).then((d) => setFeatured(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/config").then((r) => r.json()).then((c) => setHero(c?.heroImage || "")).catch(() => {});
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">● DROP 07 — OTOÑO/INVIERNO</p>
          <h1>
            VESTÍ<br />
            <span className="outline">LA CALLE</span>
          </h1>
          <p className="hero-sub">Prendas oversized, cortes baggy y piezas limitadas. Hecho para los que no piden permiso.</p>
          <div className="hero-cta">
            <Link to="/productos" className="btn btn-primary">COMPRAR AHORA →</Link>
            <Link to="/productos?sale=1" className="btn btn-ghost">VER SALE</Link>
          </div>
        </div>
        <div className="hero-visual">
          {hero ? (
            <img src={hero} alt="Lookbook" referrerPolicy="no-referrer" />
          ) : (
            <div className="hero-art">
              <span>V</span>
              <span>O</span>
              <span>I</span>
              <span>D</span>
            </div>
          )}
          <div className="sticker">NEW<br />DROP</div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee">
        <div className="marquee-track">
          {[...WORDS, ...WORDS, ...WORDS].map((w, i) => (
            <span key={i}>{w} <i>✦</i></span>
          ))}
        </div>
      </div>

      {/* CATEGORÍAS */}
      <section className="section">
        <div className="section-head">
          <h2>COMPRÁ POR <span className="hl">CATEGORÍA</span></h2>
          <Link to="/productos" className="link">Ver todo →</Link>
        </div>
        <div className="cats">
          {CATS.map((c) => (
            <Link key={c.key} to={`/productos?category=${c.key}`} className={`cat ${c.cls}`}>
              <span className="cat-label">{c.label}</span>
              <span className="cat-arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>

      {/* NOVEDADES */}
      <section className="section">
        <div className="section-head">
          <h2>LO <span className="hl">ÚLTIMO</span></h2>
          <Link to="/productos?sort=new" className="link">Ver novedades →</Link>
        </div>
        <div className="grid grid-4">
          {featured.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* BANNER */}
      <section className="banner">
        <h2>HASTA <em>40%</em> OFF</h2>
        <p>Últimas unidades de la temporada. Cuando se van, se van.</p>
        <Link to="/productos?sale=1" className="btn btn-dark">IR AL SALE →</Link>
      </section>

      {/* BENEFICIOS */}
      <section className="perks">
        <div><b>01</b><h4>Envío gratis</h4><p>En compras desde $100.000</p></div>
        <div><b>02</b><h4>Cambios fáciles</h4><p>30 días sin vueltas</p></div>
        <div><b>03</b><h4>3 cuotas sin interés</h4><p>Con todas las tarjetas</p></div>
        <div><b>04</b><h4>Ediciones limitadas</h4><p>Piezas únicas por drop</p></div>
      </section>

      {/* NEWSLETTER */}
      <section className="news">
        <h2>ENTRÁ A LA <span className="hl">LISTA</span></h2>
        <p>Acceso anticipado a los drops y 10% OFF en tu primera compra.</p>
        <form onSubmit={(e) => { e.preventDefault(); e.target.reset(); alert("¡Listo, estás adentro!"); }}>
          <input type="email" required placeholder="tu@email.com" aria-label="Email" />
          <button className="btn btn-primary">SUMARME</button>
        </form>
      </section>
    </>
  );
}
