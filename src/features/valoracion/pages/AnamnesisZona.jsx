import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import BotonImportante from "../../../shared/components/BotonImportante/BotonImportante";
import logoWakeup from "../../../assets/LogoWakeup.png";
import ValoracionStepper from "../components/ValoracionStepper";
import ZonaRenderer from "../components/zonas/ZonaRenderer";

import { alertConfirm, alertError, alertOk } from "../../../shared/lib/alerts";
import { obtenerValoracionActiva } from "../utils/valoracionSession";
import { eleccionDePasoAFotos } from "../config/eleccionDePasoAFotos";
import {
  resolverDocumentoPacienteDesdeCache,
  resolverProfesionalCedulaDesdeCache,
  resolverProfesionalObjetoDesdeCache,
} from "../utils/zonaPersistContext";

import "./Valoracion.css";

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

function formatearListaZonas(zonas = []) {
  return zonas.map(capitalizarZona).join(", ");
}

/**
 * Construye un único mensaje resumido para mostrar en alert.
 *
 * Ejemplo:
 * De las zonas (Cadera, Hombro), se enviarán todos los formularios.
 * Solo la zona (Hombro) pasará a módulo de fotos.
 * La zona (Cadera) queda suspendida por alertas hasta revisión profesional.
 */
function construirMensajePasoAFotos({
  zonasEvaluadas = [],
  zonasAptasParaFotos = [],
  zonasSuspendidasPorRevision = [],
}) {
  const partes = [];

  if (zonasEvaluadas.length > 0) {
    partes.push(
      `De las zonas (${formatearListaZonas(
        zonasEvaluadas,
      )}), se enviarán todos los formularios.`,
    );
  }

  if (zonasAptasParaFotos.length > 0) {
    const textoZona =
      zonasAptasParaFotos.length === 1 ? "Solo la zona" : "Solo las zonas";

    partes.push(
      `${textoZona} (${formatearListaZonas(
        zonasAptasParaFotos,
      )}) pasarán a módulo de fotos.`,
    );
  }

  if (zonasSuspendidasPorRevision.length > 0) {
    const textoZona =
      zonasSuspendidasPorRevision.length === 1 ? "La zona" : "Las zonas";

    partes.push(
      `${textoZona} (${formatearListaZonas(
        zonasSuspendidasPorRevision,
      )}) quedan suspendidas por alertas hasta revisión profesional.`,
    );
  }

  return partes.join("\n\n");
}

export default function AnamnesisZona() {
  const navigate = useNavigate();
  const location = useLocation();

  const valoracionActiva = useMemo(() => obtenerValoracionActiva(), []);

  const zonasDetectadasRaw = location.state?.zonasDetectadas || [];
  const zonasDetectadas = zonasDetectadasRaw
    .map(normalizarZona)
    .filter(Boolean);

  // Recupera paciente desde location.state o desde la valoración activa guardada.
  const paciente =
    location.state?.paciente || valoracionActiva?.paciente || null;

  const cedula = useMemo(
    () =>
      resolverDocumentoPacienteDesdeCache({
        propDocumento: "",
        locationState: location.state,
        valoracionActiva,
      }),
    [location.state, valoracionActiva],
  );

  const profesional = useMemo(
    () => resolverProfesionalObjetoDesdeCache({ locationState: location.state }),
    [location.state],
  );

  const profesionalCedulaParaZonas = useMemo(
    () =>
      resolverProfesionalCedulaDesdeCache({
        propCedula: profesional?.cedula,
        locationState: location.state,
      }),
    [profesional?.cedula, location.state],
  );

  // Guarda el resultado persistido por cada zona evaluada.
  const [evaluacionesPorZona, setEvaluacionesPorZona] = useState({});
  const [resetCounter, setResetCounter] = useState(0);

  // Evita repetir el mismo alert varias veces para el mismo resumen.
  const [ultimoResumenAlertado, setUltimoResumenAlertado] = useState("");

  function handleZonaEvaluada(zona, payload) {
    const zonaNormalizada = normalizarZona(zona);

    // Guarda el resultado de la zona en memoria local del flujo.
    // Ojo: el guardado real a BD ocurre dentro del formulario de cada zona.
    setEvaluacionesPorZona((prev) => ({
      ...prev,
      [zonaNormalizada]: payload,
    }));
  }

  // Usa el módulo externo para decidir qué zonas pasan a fotos
  // y cuáles quedan suspendidas por revisión profesional.
  const resumenZonas = useMemo(() => {
    return eleccionDePasoAFotos(evaluacionesPorZona);
  }, [evaluacionesPorZona]);

  useEffect(() => {
    // Solo muestra alert cuando exista al menos una zona suspendida.
    if (resumenZonas.zonasSuspendidasPorRevision.length === 0) return;

    const mensaje = construirMensajePasoAFotos(resumenZonas);

    // Evita mostrar exactamente el mismo resumen más de una vez.
    if (!mensaje || mensaje === ultimoResumenAlertado) return;

    alertOk("Resultado del envío por zonas", mensaje);
    setUltimoResumenAlertado(mensaje);
  }, [resumenZonas, ultimoResumenAlertado]);

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
    setUltimoResumenAlertado("");

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

        // Solo se envían a fotos las zonas que sí quedaron habilitadas.
        zonasProtocoloFotos: resumenZonas.zonasAptasParaFotos,

        // Se conserva el resumen completo por si luego lo necesitas mostrar.
        evaluacionesPorZona,
        zonasDetectadas,
        zonasSuspendidasPorRevision: resumenZonas.zonasSuspendidasPorRevision,
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
                  numeroDocumento={cedula}
                  numero_documento_fisico={cedula}
                  profesionalCedula={profesionalCedulaParaZonas}
                  profesional_cedula={profesionalCedulaParaZonas}
                />
              ))}

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
