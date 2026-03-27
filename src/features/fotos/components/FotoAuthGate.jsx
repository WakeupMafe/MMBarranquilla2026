import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../../../shared/lib/supabaseClient";
import BotonImportante from "../../../shared/components/BotonImportante/BotonImportante";
import "./FotoAuthGate.css";

function getZonaLabel(zona) {
  const value = String(zona || "")
    .trim()
    .toLowerCase();

  if (!value) return "No definida";
  if (value.includes("hombro")) return "Hombro";
  if (value.includes("rodilla")) return "Rodilla";
  if (value.includes("cadera")) return "Cadera";
  if (value.includes("lumbar") || value.includes("espalda")) return "Lumbalgia";
  if (value.includes("funcional")) return "Funcional";

  return zona;
}

export default function FotoAuthGate({ children }) {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const zonaActiva = useMemo(() => {
    return (
      location.state?.zonaSeleccionadaFinal ||
      location.state?.zonaProtocoloFotos ||
      location.state?.resultado?.zonasDetectadas?.[0] ||
      location.state?.clasificacionPaciente?.zonaSecundaria ||
      location.state?.clasificacionPaciente?.zonaDestino ||
      "funcional"
    );
  }, [location.state]);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(session ?? null);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;

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
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
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
            <div>
              <p className="fotoAuthUser">
                Sesión activa: <strong>{session.user.email}</strong>
              </p>
              <p className="fotoAuthUser">
                Protocolo activo: <strong>{getZonaLabel(zonaActiva)}</strong>
              </p>
            </div>
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
          Inicia sesión para cargar de forma segura el protocolo fotográfico
          correspondiente a <strong>{getZonaLabel(zonaActiva)}</strong>.
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

          <BotonImportante type="submit" fullWidth disabled={submitting}>
            {submitting ? "Ingresando..." : "Ingresar al módulo"}
          </BotonImportante>
        </form>
      </div>
    </div>
  );
}
