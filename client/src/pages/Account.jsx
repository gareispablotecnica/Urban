import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth.jsx";

// Página protegida: solo se ve con sesión iniciada
export default function Account() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) return <div className="account"><p className="auth-sub">Cargando tu cuenta...</p></div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  const since = new Date(user.created_at.replace(" ", "T") + "Z").toLocaleDateString("es-AR", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="account">
      <p className="eyebrow">● MI CUENTA</p>
      <h1>HOLA, <span className="hl">{user.name.split(" ")[0]}</span></h1>

      <dl className="account-card">
        <div><dt>Nombre</dt><dd>{user.name}</dd></div>
        <div><dt>Email</dt><dd>{user.email}</dd></div>
        <div><dt>Tipo de cuenta</dt><dd className="cap">{user.role}</dd></div>
        <div><dt>Miembro desde</dt><dd>{since}</dd></div>
      </dl>

      <div className="hero-cta">
        <Link to="/productos" className="btn btn-primary">SEGUIR COMPRANDO →</Link>
        <button className="btn btn-ghost" onClick={logout}>CERRAR SESIÓN</button>
      </div>
    </div>
  );
}
