import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const [checkingSession, setCheckingSession] = useState(true);
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

    async function restoreSession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error("Error restaurando sesión de fotos:", error);
        }

        setSession(session ?? null);
      } catch (err) {
        console.error("Error verificando sesión de fotos:", err);
        if (mounted) setSession(null);
      } finally {
        if (mounted) setCheckingSession(false);
      }
    }

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;

      // ✅ CAMBIO CLAVE:
      // Mantiene sincronizado el gate con la sesión real de Supabase.
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message || "No se pudo iniciar sesión.");
      setSubmitting(false);
      return;
    }

    setSession(data?.session ?? null);
    setSubmitting(false);
  };

  const rutaOrigen = String(
    location.state?.from || location.state?.origen || "",
  ).trim();

  const vieneDesdeAnamnesisZona =
    rutaOrigen === "/herramientas/anamnesis-zona" ||
    location.state?.vieneDesdeAnamnesisZona === true;

  const vieneDesdeHerramientas =
    rutaOrigen === "/herramientas" ||
    location.state?.vieneDesdeHerramientas === true;

  // ✅ CAMBIO CLAVE:
  // Volver lineal según el paso anterior real del flujo.
  const handleVolver = () => {
    if (vieneDesdeAnamnesisZona) {
      navigate("/herramientas/anamnesis-zona", {
        state: {
          ...location.state,
        },
      });
      return;
    }

    if (vieneDesdeHerramientas) {
      navigate("/herramientas");
      return;
    }

    // ✅ CAMBIO CLAVE:
    // Fallback seguro cuando no llega origen.
    navigate("/herramientas");
  };

  if (checkingSession) {
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

            <button
              type="button"
              className="fotoAuthBackButton"
              onClick={handleVolver}
            >
              ← Volver
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
        <button
          type="button"
          className="fotoAuthBackButton fotoAuthBackButton--standalone"
          onClick={handleVolver}
        >
          ← Volver
        </button>

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
