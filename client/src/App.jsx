import { useEffect, useState } from "react";
import { Routes, Route, NavLink, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";

export default function App() {
  const { pathname } = useLocation();
  const [cart, setCart] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <div className="topbar">
        <span>ENVÍOS GRATIS A TODO EL PAÍS +$100.000</span>
        <span>/</span>
        <span>3 CUOTAS SIN INTERÉS</span>
        <span>/</span>
        <span>DROP 07 YA DISPONIBLE</span>
      </div>

      <header className="nav">
        <Link to="/" className="logo">VOID<sup>®</sup></Link>
        <nav>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/productos">Productos</NavLink>
          <Link to="/productos?sale=1" className="hot">Sale</Link>
        </nav>
        <button className="cart" onClick={() => setCart(0)} title="Vaciar carrito">
          BAG <b>{cart}</b>
        </button>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Products onAdd={() => setCart((c) => c + 1)} />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer-big">VOID<sup>®</sup></div>
        <div className="footer-cols">
          <div>
            <h4>Tienda</h4>
            <Link to="/productos">Todo</Link>
            <Link to="/productos?category=hoodies">Hoodies</Link>
            <Link to="/productos?category=pantalones">Pantalones</Link>
          </div>
          <div>
            <h4>Ayuda</h4>
            <a href="#!">Envíos</a>
            <a href="#!">Cambios</a>
            <a href="#!">Talles</a>
          </div>
          <div>
            <h4>Seguinos</h4>
            <a href="#!">Instagram</a>
            <a href="#!">TikTok</a>
            <a href="#!">Pinterest</a>
          </div>
        </div>
        <p>© {new Date().getFullYear()} VOID Streetwear. Hecho en la calle.</p>
      </footer>
    </>
  );
}
