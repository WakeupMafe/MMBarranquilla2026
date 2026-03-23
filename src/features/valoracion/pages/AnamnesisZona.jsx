import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import logoWakeup from "../../../assets/LogoWakeup.png";

import ZonaRenderer from "../components/zonas/ZonaRenderer";

import "./Valoracion.css";

function normalizarZona(zona) {
  return String(zona || "")
    .trim()
    .toLowerCase();
}

export default function AnamnesisZona() {
  const navigate = useNavigate();
  const location = useLocation();

  const zonasDetectadasRaw = location.state?.zonasDetectadas || [];
  const zonasDetectadas = zonasDetectadasRaw.map(normalizarZona);

  const paciente = location.state?.paciente || null;
  const cedula =
    location.state?.cedula ||
    paciente?.numero_documento_fisico ||
    paciente?.cedula ||
    "";

  const [evaluacionesPorZona, setEvaluacionesPorZona] = useState({});

  function handleZonaEvaluada(zona, payload) {
    const zonaNormalizada = normalizarZona(zona);

    setEvaluacionesPorZona((prev) => ({
      ...prev,
      [zonaNormalizada]: payload,
    }));
  }

  const resumenZonas = useMemo(() => {
    const zonasEvaluadas = Object.entries(evaluacionesPorZona);

    const zonasAptasParaFotos = zonasEvaluadas
      .filter(
        ([, value]) =>
          value?.resultado && !value.resultado.requiereRevisionProfesional,
      )
      .map(([zona]) => zona);

    const zonasConRevisionProfesional = zonasEvaluadas
      .filter(([, value]) => value?.resultado?.requiereRevisionProfesional)
      .map(([zona]) => zona);

    return {
      zonasEvaluadas: zonasEvaluadas.map(([zona]) => zona),
      zonasAptasParaFotos,
      zonasConRevisionProfesional,
    };
  }, [evaluacionesPorZona]);

  function handleIrAFotosGlobal() {
    if (resumenZonas.zonasAptasParaFotos.length === 0) return;

    navigate("/herramientas/fotos-test", {
      state: {
        paciente,
        cedula,
        zonasProtocoloFotos: resumenZonas.zonasAptasParaFotos,
        evaluacionesPorZona,
      },
    });
  }

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
                  {cedula && (
                    <li>
                      <strong>Cédula:</strong> {cedula}
                    </li>
                  )}
                </ul>
              </div>

              {zonasDetectadas.map((zona) => (
                <ZonaRenderer
                  key={zona}
                  zona={zona}
                  onZonaEvaluada={handleZonaEvaluada}
                  resultadoPersistido={evaluacionesPorZona[zona]}
                />
              ))}

              {resumenZonas.zonasConRevisionProfesional.length > 0 && (
                <div className="valoracionStatusAlert valoracionStatusAlert--warn">
                  <strong>Zonas con revisión profesional requerida</strong>
                  <p>
                    Las siguientes zonas presentan criterios de posible descarte
                    y no serán habilitadas para el protocolo fotográfico hasta
                    contar con validación profesional:
                  </p>
                  <ul className="anamnesisInlineList">
                    {resumenZonas.zonasConRevisionProfesional.map((zona) => (
                      <li key={zona}>{zona}</li>
                    ))}
                  </ul>
                </div>
              )}

              {resumenZonas.zonasAptasParaFotos.length > 0 && (
                <div className="anamnesisResultadoCard">
                  <h4 className="anamnesisSectionTitle">
                    Protocolo fotográfico habilitado
                  </h4>

                  <ul className="valoracionPacienteList">
                    <li>
                      <strong>Zonas aptas para fotos:</strong>{" "}
                      {resumenZonas.zonasAptasParaFotos.join(", ")}
                    </li>
                    <li>
                      <strong>Total de zonas habilitadas:</strong>{" "}
                      {resumenZonas.zonasAptasParaFotos.length}
                    </li>
                  </ul>

                  <div
                    className="valoracionActions"
                    style={{ marginTop: "16px" }}
                  >
                    <button
                      type="button"
                      className="valoracionPrimaryBtn"
                      onClick={handleIrAFotosGlobal}
                    >
                      Continuar a protocolo fotográfico
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
