import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard, { money } from "../components/ProductCard.jsx";

const COLOR_HEX = {
  negro: "#111", blanco: "#f2f2f2", gris: "#777", azul: "#1b2bff",
  verde: "#0b8a55", rojo: "#d3122a", beige: "#cdbd9f",
};

// Lee/escribe arrays en la URL como "a,b,c"
const toArr = (v) => (v ? v.split(",").filter(Boolean) : []);

export default function Products({ onAdd }) {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // panel filtros en móvil

  const category = toArr(params.get("category"));
  const color = toArr(params.get("color"));
  const size = toArr(params.get("size"));
  const sale = params.get("sale") === "1";
  const sort = params.get("sort") || "";
  const q = params.get("q") || "";
  const max = params.get("max");

  useEffect(() => {
    fetch("/api/filters").then((r) => r.json()).then((d) => d && d.categories && setFilters(d)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => { setItems(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === "" || value == null || value === false || (Array.isArray(value) && !value.length)) next.delete(key);
    else next.set(key, Array.isArray(value) ? value.join(",") : value === true ? "1" : value);
    setParams(next, { replace: true });
  };

  const toggle = (key, current, v) =>
    update(key, current.includes(v) ? current.filter((x) => x !== v) : [...current, v]);

  const activeCount = category.length + color.length + size.length + (sale ? 1 : 0) + (max ? 1 : 0) + (q ? 1 : 0);
  const clear = () => setParams({}, { replace: true });

  const maxPrice = useMemo(() => (max ? Number(max) : filters?.maxPrice ?? 0), [max, filters]);

  return (
    <div className="shop">
      <div className="shop-head">
        <h1>PRODUCTOS <sup>{items.length}</sup></h1>
        <div className="shop-tools">
          <input
            className="search"
            type="search"
            placeholder="Buscar prenda..."
            value={q}
            onChange={(e) => update("q", e.target.value)}
          />
          <select value={sort} onChange={(e) => update("sort", e.target.value)} aria-label="Ordenar">
            <option value="">Relevancia</option>
            <option value="new">Novedades</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="name">Nombre A-Z</option>
          </select>
          <button className="btn btn-ghost filter-toggle" onClick={() => setOpen(true)}>
            FILTROS {activeCount > 0 && `(${activeCount})`}
          </button>
        </div>
      </div>

      <div className="shop-body">
        <aside className={`filters ${open ? "open" : ""}`}>
          <div className="filters-top">
            <h3>FILTROS</h3>
            <button className="x" onClick={() => setOpen(false)} aria-label="Cerrar">✕</button>
          </div>

          {filters && (
            <>
              <div className="f-group">
                <h4>Categoría</h4>
                {filters.categories.map((c) => (
                  <label key={c.name} className="check">
                    <input type="checkbox" checked={category.includes(c.name)} onChange={() => toggle("category", category, c.name)} />
                    <span className="box" />
                    <span className="cap">{c.name}</span>
                    <em>{c.count}</em>
                  </label>
                ))}
              </div>

              <div className="f-group">
                <h4>Talle</h4>
                <div className="chips">
                  {filters.sizes.map((s) => (
                    <button key={s} className={`chip ${size.includes(s) ? "on" : ""}`} onClick={() => toggle("size", size, s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="f-group">
                <h4>Color</h4>
                <div className="swatches">
                  {filters.colors.map((c) => (
                    <button
                      key={c}
                      title={c}
                      aria-label={c}
                      className={`swatch ${color.includes(c) ? "on" : ""}`}
                      style={{ background: COLOR_HEX[c] || "#555" }}
                      onClick={() => toggle("color", color, c)}
                    />
                  ))}
                </div>
              </div>

              <div className="f-group">
                <h4>Precio máximo</h4>
                <input
                  type="range"
                  min={filters.minPrice}
                  max={filters.maxPrice}
                  step={1000}
                  value={maxPrice}
                  onChange={(e) => update("max", Number(e.target.value) >= filters.maxPrice ? "" : e.target.value)}
                />
                <div className="range-val">Hasta <b>{money(maxPrice)}</b></div>
              </div>

              <div className="f-group">
                <label className="check">
                  <input type="checkbox" checked={sale} onChange={(e) => update("sale", e.target.checked)} />
                  <span className="box" />
                  <span className="cap">Solo en oferta</span>
                </label>
              </div>
            </>
          )}

          <div className="filters-actions">
            <button className="btn btn-ghost" onClick={clear} disabled={!activeCount}>LIMPIAR</button>
            <button className="btn btn-primary only-mobile" onClick={() => setOpen(false)}>VER {items.length}</button>
          </div>
        </aside>
        {open && <div className="overlay" onClick={() => setOpen(false)} />}

        <section className="results">
          {loading ? (
            <div className="grid">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="empty">
              <h3>Nada por acá</h3>
              <p>Ninguna prenda coincide con esos filtros. Probá sacando alguno.</p>
              <button className="btn btn-primary" onClick={clear}>LIMPIAR FILTROS</button>
            </div>
          ) : (
            <div className="grid">
              {items.map((p) => <ProductCard key={p.id} p={p} onAdd={onAdd} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
