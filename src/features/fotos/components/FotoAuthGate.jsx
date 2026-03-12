import { useEffect, useState } from "react";
import { supabase } from "../../../shared/lib/supabaseClient";
import "./FotoAuthGate.css";

export default function FotoAuthGate({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setSession(session ?? null);
        setLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message || "No se pudo iniciar sesión.");
    }

    setSubmitting(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="fotoAuthPage">
        <div className="fotoAuthCard">
          <p className="fotoAuthText">Cargando acceso al módulo de fotos...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <>
        <div className="fotoAuthTopbar">
          <div className="fotoAuthTopbar__content">
            <p className="fotoAuthUser">
              Sesión activa: <strong>{session.user.email}</strong>
            </p>

            <button
              type="button"
              className="fotoAuthLogoutBtn"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {children}
      </>
    );
  }

  return (
    <div className="fotoAuthPage">
      <div className="fotoAuthCard">
        <h2 className="fotoAuthTitle">Acceso al módulo de fotos</h2>
        <p className="fotoAuthText">
          Inicia sesión para subir fotos de forma segura.
        </p>

        <form className="fotoAuthForm" onSubmit={handleLogin}>
          <div className="fotoAuthField">
            <label className="fotoAuthLabel" htmlFor="foto-auth-email">
              Correo
            </label>
            <input
              id="foto-auth-email"
              type="email"
              className="fotoAuthInput"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="fotoAuthField">
            <label className="fotoAuthLabel" htmlFor="foto-auth-password">
              Contraseña
            </label>
            <input
              id="foto-auth-password"
              type="password"
              className="fotoAuthInput"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              autoComplete="current-password"
              required
            />
          </div>

          {error ? <p className="fotoAuthError">{error}</p> : null}

          <button
            type="submit"
            className="fotoAuthSubmit"
            disabled={submitting}
          >
            {submitting ? "Ingresando..." : "Ingresar al módulo"}
          </button>
        </form>
      </div>
    </div>
  );
}
