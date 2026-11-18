import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

// Una sola pantalla para ingresar y para crear cuenta
export default function Auth({ mode }) {
  const isRegister = mode === "register";
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/cuenta";

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isRegister) await register(form.name, form.email, form.password);
      else await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-side">
        <p className="eyebrow">● {isRegister ? "NUEVA CUENTA" : "BIENVENIDO DE VUELTA"}</p>
        <h1>{isRegister ? <>SUMATE A <span className="hl">VOID</span></> : <>ENTRÁ A TU <span className="hl">CUENTA</span></>}</h1>
        <p className="auth-sub">
          {isRegister
            ? "Creá tu cuenta para guardar tus datos y enterarte primero de cada drop."
            : "Ingresá para ver tu cuenta y seguir comprando."}
        </p>
      </div>

      <form className="auth-card" onSubmit={submit} noValidate>
        {isRegister && (
          <div className="field">
            <label htmlFor="name">Nombre</label>
            <input id="name" autoComplete="name" value={form.name} onChange={set("name")} required />
          </div>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} required />
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            value={form.password}
            onChange={set("password")}
            required
          />
          {isRegister && <small>Mínimo 6 caracteres.</small>}
        </div>

        {error && <div className="form-error" role="alert">{error}</div>}

        <button className="btn btn-primary" disabled={busy}>
          {busy ? "UN MOMENTO..." : isRegister ? "CREAR CUENTA" : "INGRESAR"}
        </button>

        <p className="auth-switch">
          {isRegister ? (
            <>¿Ya tenés cuenta? <Link to="/login" state={location.state}>Ingresá</Link></>
          ) : (
            <>¿Todavía no tenés cuenta? <Link to="/registro" state={location.state}>Registrate</Link></>
          )}
        </p>
      </form>
    </div>
  );
}
