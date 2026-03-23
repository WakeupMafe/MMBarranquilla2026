import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import BotonImportante from "../../../shared/components/BotonImportante/BotonImportante";
import logoWakeup from "../../../assets/LogoWakeup.png";
import ValoracionStepper from "../components/ValoracionStepper";
import ZonaRenderer from "../components/zonas/ZonaRenderer";

import { alertConfirm, alertError, alertOk } from "../../../shared/lib/alerts";

import "./Valoracion.css";

const SESSION_KEY = "wk_profesional";

function normalizarZona(zona) {
  return String(zona || "")
    .trim()
    .toLowerCase();
}

function capitalizarZona(zona) {
  const value = normalizarZona(zona);
  if (!value) return "";

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function AnamnesisZona() {
  const navigate = useNavigate();
  const location = useLocation();

  const zonasDetectadasRaw = location.state?.zonasDetectadas || [];
  const zonasDetectadas = zonasDetectadasRaw
    .map(normalizarZona)
    .filter(Boolean);

  const paciente = location.state?.paciente || null;

  const cedula =
    location.state?.cedula ||
    paciente?.numero_documento_fisico ||
    paciente?.cedula ||
    "";

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

  const [evaluacionesPorZona, setEvaluacionesPorZona] = useState({});
  const [resetCounter, setResetCounter] = useState(0);

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
          value?.resultado && !value.resultado?.requiereRevisionProfesional,
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

  function handleVolverAGlobal() {
    navigate("/herramientas/anamnesis-global", {
      state: {
        ...location.state,
        paciente,
        cedula,
        profesional,
      },
    });
  }

  async function handleLimpiarTodaLaAnamnesis() {
    const hayInformacion =
      Object.keys(evaluacionesPorZona).length > 0 || zonasDetectadas.length > 0;

    if (!hayInformacion) {
      await alertError(
        "Nada para limpiar",
        "No hay información cargada actualmente en la anamnesis por zona.",
      );
      return;
    }

    const ok = await alertConfirm({
      title: "Limpiar anamnesis por zona",
      text: "Se reiniciarán todas las zonas evaluadas de esta pantalla. ¿Deseas continuar?",
      confirmText: "Sí, limpiar todo",
      cancelText: "Cancelar",
    });

    if (!ok) return;

    setEvaluacionesPorZona({});
    setResetCounter((prev) => prev + 1);

    await alertOk(
      "Anamnesis reiniciada",
      "Se limpió toda la anamnesis por zona correctamente.",
    );
  }

  function handleIrAFotosGlobal() {
    if (resumenZonas.zonasAptasParaFotos.length === 0) return;

    navigate("/herramientas/fotos-test", {
      state: {
        ...location.state,
        paciente,
        cedula,
        profesional,
        zonasProtocoloFotos: resumenZonas.zonasAptasParaFotos,
        evaluacionesPorZona,
        zonasDetectadas,
      },
    });
  }

  return (
    <div className="valoracionShell">
      <TopHeader
        userName={profesional?.nombre || "Profesional"}
        onLogout={() => navigate("/")}
        logoSrc={logoWakeup}
      />

      <main className="valoracionPage">
        <section className="valoracionHero">
          <h1 className="valoracionTitle">Anamnesis por zona</h1>
          <p className="valoracionSubtitle">
            Se activan únicamente las zonas detectadas desde la anamnesis
            global.
          </p>
        </section>

        <ValoracionStepper currentStep={4} />

        <section className="valoracionCard">
          <div className="valoracionCardHeader">
            <h2 className="valoracionCardTitle">Zonas activas</h2>
            <p className="valoracionCardDescription">
              Completa la anamnesis específica para cada zona detectada.
            </p>
          </div>

          <div className="valoracionActions valoracionActions--wrap">
            <BotonImportante variant="ghost" onClick={handleVolverAGlobal}>
              ← Volver a anamnesis global
            </BotonImportante>

            <BotonImportante
              variant="solid"
              onClick={handleLimpiarTodaLaAnamnesis}
            >
              Limpiar toda la anamnesis
            </BotonImportante>
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
                    {zonasDetectadas.map(capitalizarZona).join(", ")}
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
                  key={`${zona}-${resetCounter}`}
                  zona={zona}
                  onZonaEvaluada={handleZonaEvaluada}
                  resultadoPersistido={evaluacionesPorZona[zona]}
                />
              ))}

              {resumenZonas.zonasConRevisionProfesional.length > 0 && (
                <div className="valoracionStatusAlert valoracionStatusAlert--warn">
                  <strong>Zonas con revisión profesional requerida</strong>
                  <p>
                    Las siguientes zonas presentan criterios que requieren
                    validación profesional antes del protocolo fotográfico:
                  </p>
                  <ul className="anamnesisInlineList">
                    {resumenZonas.zonasConRevisionProfesional.map((zona) => (
                      <li key={zona}>{capitalizarZona(zona)}</li>
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
                      {resumenZonas.zonasAptasParaFotos
                        .map(capitalizarZona)
                        .join(", ")}
                    </li>
                    <li>
                      <strong>Total de zonas habilitadas:</strong>{" "}
                      {resumenZonas.zonasAptasParaFotos.length}
                    </li>
                  </ul>

                  <div
                    className="valoracionActions valoracionActions--wrap"
                    style={{ marginTop: "16px" }}
                  >
                    <BotonImportante
                      variant="solid"
                      onClick={handleIrAFotosGlobal}
                    >
                      Continuar a protocolo fotográfico
                    </BotonImportante>
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
