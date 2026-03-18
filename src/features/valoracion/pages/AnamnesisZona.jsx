import { useLocation, useNavigate } from "react-router-dom";

import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import logoWakeup from "../../../assets/LogoWakeup.png";

import ZonaRenderer from "../components/zonas/ZonaRenderer";

import "./Valoracion.css";

export default function AnamnesisZona() {
  const navigate = useNavigate();
  const location = useLocation();

  const zonasDetectadas = location.state?.zonasDetectadas || [];

  return (
    <div className="valoracionShell">
      <TopHeader
        userName="Profesional"
        onLogout={() => navigate("/")}
        logoSrc={logoWakeup}
      />

      <main className="valoracionPage">
        <div className="valoracionTopActions">
          <button
            type="button"
            className="valoracionBackBtn"
            onClick={() => navigate(-1)}
          >
            ← Volver
          </button>
        </div>

        <section className="valoracionHero">
          <h1 className="valoracionTitle">Anamnesis por zona</h1>
          <p className="valoracionSubtitle">
            Se activan únicamente las zonas detectadas en la anamnesis global
          </p>
        </section>

        <section className="valoracionStepper" aria-label="Progreso">
          <div className="stepItem">
            <span className="stepNumber">1</span>
            <span className="stepText">Datos generales</span>
          </div>

          <div className="stepItem">
            <span className="stepNumber">2</span>
            <span className="stepText">Anamnesis global</span>
          </div>

          <div className="stepItem stepItem--active">
            <span className="stepNumber">3</span>
            <span className="stepText">Detección de dolor</span>
          </div>

          <div className="stepItem">
            <span className="stepNumber">4</span>
            <span className="stepText">Clasificación preliminar</span>
          </div>
        </section>

        <section className="valoracionCard">
          <div className="valoracionCardHeader">
            <h2 className="valoracionCardTitle">Zonas activas</h2>
            <p className="valoracionCardDescription">
              Aquí se mostrará la anamnesis específica según las zonas
              detectadas automáticamente.
            </p>
          </div>

          {zonasDetectadas.length === 0 && (
            <div className="valoracionStatusAlert valoracionStatusAlert--info">
              <strong>No hay zonas detectadas.</strong>
              <p>
                Regresa a la anamnesis global y valida el flujo del paciente.
              </p>
            </div>
          )}

          {zonasDetectadas.length > 0 && (
            <>
              <div className="valoracionPacienteCard">
                <ul className="valoracionPacienteList">
                  <li>
                    <strong>Zonas detectadas:</strong>{" "}
                    {zonasDetectadas.join(", ")}
                  </li>
                  <li>
                    <strong>Cantidad de zonas:</strong> {zonasDetectadas.length}
                  </li>
                </ul>
              </div>

              {zonasDetectadas.map((zona) => (
                <ZonaRenderer key={zona} zona={zona} />
              ))}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
