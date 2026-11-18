import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const KEY = "void_token";

// localStorage puede fallar (modo privado, etc.), por eso va dentro de try/catch
const readToken = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};
const writeToken = (t) => {
  try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch { /* sin storage */ }
};

async function request(path, body, token) {
  const res = await fetch(path, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Algo salió mal. Probá de nuevo.");
  return data;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(readToken()));

  // Al abrir la web, si hay token guardado, recupera los datos del usuario
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    request("/api/auth/me", null, token)
      .then((d) => { if (!cancelled) setUser(d.user); })
      .catch(() => {
        if (!cancelled) { writeToken(null); setToken(null); setUser(null); }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

  const save = (d) => {
    writeToken(d.token);
    setToken(d.token);
    setUser(d.user);
  };

  const login = async (email, password) => save(await request("/api/auth/login", { email, password }));
  const register = async (name, email, password) =>
    save(await request("/api/auth/register", { name, email, password }));
  const logout = () => {
    writeToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
