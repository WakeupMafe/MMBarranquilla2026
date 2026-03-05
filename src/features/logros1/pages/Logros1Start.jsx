import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { alertConfirm, alertError, alertOk } from "../../../shared/lib/alerts";
import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import BuscarParticipante from "../../../shared/components/BuscarParticipante/BuscarParticipante";

import logoWakeup from "../../../assets/LogoWakeup.png";

const SESSION_KEY = "wk_profesional";

export default function Logros1Start() {
  const navigate = useNavigate();
  const location = useLocation();

  const profesional = useMemo(() => {
    const fromState = location.state?.profesional;
    if (fromState) return fromState;

    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state?.profesional) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(location.state.profesional),
      );
    }
  }, [location.state]);

  useEffect(() => {
    if (!profesional) {
      alertError(
        "Acceso restringido",
        "Debes ingresar tu cédula para acceder a las herramientas.",
      );
      navigate("/", { replace: true });
    }
  }, [profesional, navigate]);

  if (!profesional) return null;

  const userName = profesional.nombre;

  const handleLogout = async () => {
    const ok = await alertConfirm({
      title: "Cerrar sesión",
      text: "¿Deseas salir de la plataforma?",
      confirmText: "Sí, salir",
      cancelText: "Cancelar",
    });

    if (!ok) return;

    sessionStorage.removeItem(SESSION_KEY);

    await alertOk("Sesión cerrada", "Has salido correctamente.");

    navigate("/", { replace: true });
  };

  const onEncontrado = (paciente) => {
    navigate("/herramientas/logros-1/encuesta", {
      state: { paciente, profesional },
    });
  };

  return (
    <div className="page">
      <TopHeader
        userName={userName}
        logoSrc={logoWakeup}
        onLogout={handleLogout}
      />

      <BuscarParticipante
        titulo="Logros Fase 1"
        subtitulo="Seguimiento y registro de objetivos"
        onEncontrado={onEncontrado}
      />
    </div>
  );
}
