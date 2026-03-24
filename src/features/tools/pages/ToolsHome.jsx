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
const CEDULA_ADMIN_FOTOS = "1037670182";

export default function ToolsHome() {
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

  // 🔵 Solo esta cédula puede ver la card de administración de fotos
  const puedeVerAdminFotos =
    String(profesional?.cedula || "").trim() === CEDULA_ADMIN_FOTOS;

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
            title="Módulo Obesidad"
            subtitle="Peso, talla e IMC del paciente"
            chipLeft="3–5 min"
            chipRight="Calculo"
            buttonText="Abrir"
            iconSrc={iconValoracion}
            onOpen={() => navigate("/herramientas/modulo-obesidad")}
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

        {/* 🔵 Card restringida solo para la cédula autorizada */}
        {puedeVerAdminFotos && (
          <div className="cards">
            <ToolCard
              title="Admin BD"
              subtitle="Activar o desactivar envío a base de datos"
              chipLeft="Privado"
              chipRight="Restringido"
              buttonText="Abrir"
              iconSrc={iconValoracion}
              onOpen={() => navigate("/herramientas/fotos-admin")}
            />
          </div>
        )}

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
