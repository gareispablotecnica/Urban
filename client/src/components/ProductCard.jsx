import { useState } from "react";

export const money = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

const PALETTE = {
  negro: ["#111", "#c6ff00"],
  blanco: ["#e9e9e9", "#111"],
  gris: ["#3a3a3a", "#ff3df2"],
  azul: ["#1b2bff", "#c6ff00"],
  verde: ["#0b5d3b", "#c6ff00"],
  rojo: ["#d3122a", "#fff"],
  beige: ["#cdbd9f", "#111"],
};

// Arte de reemplazo cuando no hay foto (o la URL falla)
function Fallback({ name, color, category }) {
  const [bg, fg] = PALETTE[color] || ["#222", "#c6ff00"];
  return (
    <div className="fallback" style={{ background: bg, color: fg }}>
      <span className="fb-cat">{category}</span>
      <span className="fb-name">{name}</span>
      <span className="fb-x">✕</span>
    </div>
  );
}

export default function ProductCard({ p, onAdd }) {
  const [broken, setBroken] = useState(false);
  const hasImg = p.image && !broken;
  const off = p.on_sale ? Math.round((1 - p.price / p.old_price) * 100) : 0;

  return (
    <article className="card">
      <div className="card-img">
        {hasImg ? (
          <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(true)} />
        ) : (
          <Fallback name={p.name} color={p.color} category={p.category} />
        )}
        {p.tag && <span className={`tag tag-${p.tag.toLowerCase()}`}>{p.tag === "SALE" ? `-${off}%` : p.tag}</span>}
        <button className="quick" onClick={() => onAdd?.(p)}>+ AGREGAR</button>
      </div>
      <div className="card-info">
        <h3>{p.name}</h3>
        <div className="price">
          <b>{money(p.price)}</b>
          {p.on_sale && <s>{money(p.old_price)}</s>}
        </div>
        <div className="sizes">{p.sizes.join(" · ")}</div>
      </div>
    </article>
  );
}
