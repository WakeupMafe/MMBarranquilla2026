import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { alertConfirm, alertError, alertOk } from "../../../shared/lib/alerts";
import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import ToolCard from "../../../shared/components/ToolCard/ToolCard";

import logoWakeup from "../../../assets/LogoWakeup.png";
import "./ToolsHome.css";

import iconValoracion from "../../../assets/Valoracionimg.png";
import iconLogrosF1 from "../../../assets/LogroF1.png";
import iconLogrosF2 from "../../../assets/LogroF2.png";
import iconConsultaBD from "../../../assets/ConsultaBD.png";

const SESSION_KEY = "wk_profesional";

export default function ToolsHome() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1) Traer profesional: primero state, si no sessionStorage
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

  // 2) Si llegó por state, guardarlo en sessionStorage
  useEffect(() => {
    if (location.state?.profesional) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(location.state.profesional),
      );
    }
  }, [location.state]);

  // 3) Proteger acceso (si entran directo sin login)
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

  return (
    <div className="page">
      <TopHeader
        userName={userName}
        logoSrc={logoWakeup}
        onLogout={handleLogout}
      />

      <div className="grid">
        <div className="Titulos">
          <h1>Herramientas</h1>
          <h3>Encuestas clínicas y seguimientos</h3>
        </div>

        <div className="cards">
          <ToolCard
            title="Anamnesis"
            subtitle="Clasificación del paciente"
            chipLeft="15–20 min"
            chipRight="Obligatoria"
            buttonText="Abrir"
            iconSrc={iconValoracion}
            onOpen={() => navigate("/herramientas/valoracion/check-in")}
          />
        </div>

        <div className="cards">
          <ToolCard
            title="Logros Fase 1"
            subtitle="Seguimiento y registro de objetivos"
            chipLeft="5–10 min"
            chipRight="Obligatoria"
            buttonText="Abrir"
            iconSrc={iconLogrosF1}
            onOpen={() => navigate("/herramientas/logros-1")}
          />
        </div>

        <div className="cards">
          <ToolCard
            title="Logros Fase 2"
            subtitle="Registro de avances y metas superadas"
            chipLeft="5–10 min"
            chipRight="Obligatoria"
            buttonText="Abrir"
            iconSrc={iconLogrosF2}
            onOpen={() => navigate("/herramientas/logros-2")}
          />
        </div>

        <div className="cards">
          <ToolCard
            title="Prueba de Fotos"
            subtitle="Selección, vista previa y compresión"
            chipLeft="Prueba"
            chipRight="Temporal"
            buttonText="Abrir"
            iconSrc={iconValoracion}
            onOpen={() => navigate("/herramientas/fotos-test")}
          />
        </div>

        <div className="cards">
          <ToolCard
            title="Consulta en BD"
            subtitle="Registro de avances"
            chipLeft="Externo"
            chipRight="Restringido"
            buttonText="Abrir"
            iconSrc={iconConsultaBD}
            onOpen={() =>
              window.open(
                "https://mmbarranquilla.netlify.app/",
                "_blank",
                "noopener,noreferrer",
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
