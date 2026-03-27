import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../../../shared/lib/supabaseClient";
import BotonImportante from "../../../shared/components/BotonImportante/BotonImportante";
import "./FotoAuthGate.css";

const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 horas
const SESSION_TIMER_KEY = "foto_auth_started_at";

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

function formatRemainingTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export default function FotoAuthGate({ children }) {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION_MS);

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

      if (session?.user) {
        const savedStart = sessionStorage.getItem(SESSION_TIMER_KEY);

        if (!savedStart) {
          sessionStorage.setItem(SESSION_TIMER_KEY, String(Date.now()));
        }
      } else {
        sessionStorage.removeItem(SESSION_TIMER_KEY);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setLoading(false);

      if (newSession?.user) {
        const savedStart = sessionStorage.getItem(SESSION_TIMER_KEY);

        if (!savedStart) {
          sessionStorage.setItem(SESSION_TIMER_KEY, String(Date.now()));
        }
      } else {
        sessionStorage.removeItem(SESSION_TIMER_KEY);
        setTimeLeft(SESSION_DURATION_MS);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) return;

    const tick = async () => {
      const startedAtRaw = sessionStorage.getItem(SESSION_TIMER_KEY);
      const startedAt = Number(startedAtRaw || 0);

      if (!startedAt) {
        sessionStorage.setItem(SESSION_TIMER_KEY, String(Date.now()));
        setTimeLeft(SESSION_DURATION_MS);
        return;
      }

      const expiresAt = startedAt + SESSION_DURATION_MS;
      const remaining = expiresAt - Date.now();

      if (remaining <= 0) {
        setTimeLeft(0);
        sessionStorage.removeItem(SESSION_TIMER_KEY);
        return;
      }

      setTimeLeft(remaining);
    };

    tick();

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

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

    sessionStorage.setItem(SESSION_TIMER_KEY, String(Date.now()));
    setTimeLeft(SESSION_DURATION_MS);
    setSubmitting(false);
  };

  const handleLogout = async () => {
    sessionStorage.removeItem(SESSION_TIMER_KEY);
    setTimeLeft(SESSION_DURATION_MS);
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
            <div>
              <p className="fotoAuthUser">
                Sesión activa: <strong>{session.user.email}</strong>
              </p>
              <p className="fotoAuthUser">
                Protocolo activo: <strong>{getZonaLabel(zonaActiva)}</strong>
              </p>
              <p className="fotoAuthUser">
                Tiempo restante:{" "}
                <strong>{formatRemainingTime(timeLeft)}</strong>
              </p>
            </div>

            <BotonImportante
              type="button"
              variant="outline"
              onClick={handleLogout}
            >
              Cerrar sesión
            </BotonImportante>
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

        <p className="fotoAuthText">
          La sesión de este módulo dura máximo <strong>2 horas</strong>.
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
