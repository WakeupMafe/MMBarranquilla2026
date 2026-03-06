import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { alertConfirm, alertError, alertOk } from "../../../shared/lib/alerts";
import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import BuscarParticipante from "../../../shared/components/BuscarParticipante/BuscarParticipante";
import LogrosFase1Viewer from "../../../shared/components/LogrosFase1Viewer/LogrosFase1Viewer";

import logoWakeup from "../../../assets/LogoWakeup.png";

const SESSION_KEY = "wk_profesional";

export default function Logros1Start() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pacienteConLogros, setPacienteConLogros] = useState(null);

  // 1) Traer profesional: state -> sessionStorage
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

  // 2) Si llegó por state, persistir en sessionStorage
  useEffect(() => {
    if (location.state?.profesional) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(location.state.profesional),
      );
    }
  }, [location.state]);

  // 3) Proteger acceso
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

  // 4) Logout (usa el mismo flujo que ToolsHome)
  const handleLogout = async () => {
    const ok = await alertConfirm({
      title: "Cerrar sesión",
      text: "¿Deseas salir de la plataforma?",
      confirmText: "Sí, salir",
      cancelText: "Cancelar",
    });

    if (!ok) return;

    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem("logros_paciente"); // opcional

    await alertOk("Sesión cerrada", "Has salido correctamente.");
    navigate("/", { replace: true });
  };

  // ✅ cuando el buscador diga “en participantes y NO tiene logros_fase1”
  const onEncontrado = (paciente) => {
    setPacienteConLogros(null);
    navigate("/herramientas/logros-1/encuesta", {
      state: { paciente, profesional },
    });
  };

  // ✅ cuando el buscador diga “ya existe logros_fase1”
  const onYaRegistrado = (paciente) => {
    setPacienteConLogros(paciente);
  };

  const volverHerramientas = () => {
    setPacienteConLogros(null);
    navigate("/herramientas");
  };

  return (
    <div className="page">
      <TopHeader
        userName={userName}
        logoSrc={logoWakeup}
        onLogout={handleLogout}
      />

      {/* ✅ Botón volver al menú */}
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          margin: "10px 0px 0px 25px",
        }}
      >
        <button
          type="button"
          className="back"
          onClick={volverHerramientas}
          style={{
            marginBottom: 10,
            marginRight: 20,
            fontSize: 20,
            fontWeight: 400,
          }}
        >
          ← Volver a Herramientas
        </button>
      </div>

      <BuscarParticipante
        titulo="Logros Fase 1"
        subtitulo="Seguimiento y registro de objetivos"
        onEncontrado={onEncontrado}
        onYaRegistrado={onYaRegistrado}
      />

      {pacienteConLogros ? (
        <LogrosFase1Viewer paciente={pacienteConLogros} />
      ) : null}
    </div>
  );
}
