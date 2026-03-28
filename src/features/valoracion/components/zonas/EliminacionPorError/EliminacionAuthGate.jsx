import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../../../../shared/lib/supabaseClient";
import BotonImportante from "../../../../../shared/components/BotonImportante/BotonImportante";

import "./EliminacionAuthGate.css";

const EliminacionSupabaseSessionContext = createContext(null);

/** Sesión validada por EliminacionAuthGate (misma que usa Storage para firmar URLs). */
export function useEliminacionSupabaseSession() {
  return useContext(EliminacionSupabaseSessionContext);
}

/**
 * Misma autenticación Supabase que el módulo de fotos.
 * Obligatoria antes de usar búsqueda/eliminación y para URLs firmadas de Storage.
 */
export default function EliminacionAuthGate({ children }) {
  const navigate = useNavigate();

  const [checkingSession, setCheckingSession] = useState(true);
  const [session, setSession] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const {
          data: { session: s },
          error: err,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (err) {
          console.error("Error restaurando sesión (eliminación):", err);
        }

        setSession(s ?? null);
      } catch (err) {
        console.error("Error verificando sesión (eliminación):", err);
        if (mounted) setSession(null);
      } finally {
        if (mounted) setCheckingSession(false);
      }
    }

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession ?? null);
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

    const { data, error: signError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signError) {
      setError(signError.message || "No se pudo iniciar sesión.");
      setSubmitting(false);
      return;
    }

    setSession(data?.session ?? null);
    setSubmitting(false);
  };

  const handleVolver = () => {
    navigate("/herramientas");
  };

  if (checkingSession) {
    return (
      <div className="fotoAuthPage">
        <div className="fotoAuthCard">
          <p className="fotoAuthText">Comprobando sesión segura…</p>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <EliminacionSupabaseSessionContext.Provider value={session}>
        <div className="fotoAuthTopbar">
          <div className="fotoAuthTopbar__content">
            <div>
              <p className="fotoAuthUser">
                Sesión Supabase: <strong>{session.user.email}</strong>
              </p>
              <p className="fotoAuthUser">
                Herramienta administrativa: búsqueda y eliminación de registros.
              </p>
            </div>

            <div className="eliminacion-auth-gate__actions">
              <BotonImportante variant="outline" onClick={handleVolver}>
                ← Herramientas
              </BotonImportante>
            </div>
          </div>
        </div>

        {children}
      </EliminacionSupabaseSessionContext.Provider>
    );
  }

  return (
    <div className="fotoAuthPage">
      <div className="fotoAuthCard">
        <div className="eliminacion-auth-gate__volver">
          <BotonImportante variant="outline" onClick={handleVolver}>
            ← Volver a herramientas
          </BotonImportante>
        </div>

        <h2 className="fotoAuthTitle">Acceso — búsqueda y eliminación</h2>

        <p className="fotoAuthText">
          Inicia sesión con el mismo correo y contraseña que usas en el módulo de
          fotos. Así podrás consultar la base de datos y generar enlaces seguros
          para ver las evidencias en Storage.
        </p>

        <form className="fotoAuthForm" onSubmit={handleLogin}>
          <div className="fotoAuthField">
            <label className="fotoAuthLabel" htmlFor="eliminacion-auth-email">
              Correo
            </label>
            <input
              id="eliminacion-auth-email"
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
            <label className="fotoAuthLabel" htmlFor="eliminacion-auth-password">
              Contraseña
            </label>
            <input
              id="eliminacion-auth-password"
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

          <BotonImportante type="submit" fullWidth disabled={submitting}>
            {submitting ? "Ingresando…" : "Entrar a la herramienta"}
          </BotonImportante>
        </form>
      </div>
    </div>
  );
}
