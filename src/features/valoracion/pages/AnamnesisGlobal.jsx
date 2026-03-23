import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import logoWakeup from "../../../assets/LogoWakeup.png";
import { alertConfirm, alertError } from "../../../shared/lib/alerts";

import { anamnesisSections } from "../config/anamnesisSections";
import { evaluarAnamnesisGlobal } from "../services/anamnesisGlobalRules";
import { validarAnamnesisGlobal } from "../services/validarAnamnesisGlobal";
import {
  guardarAnamnesisGlobalDraft,
  limpiarAnamnesisGlobalDraft,
} from "../utils/anamnesisGlobalDraft";
import { obtenerValoracionActiva } from "../utils/valoracionSession";
import { useAnamnesisGlobalForm } from "../hooks/useAnamnesisGlobalForm";
import AnamnesisSectionRenderer from "../components/AnamnesisSectionRenderer";
import AnamnesisResultCard from "../components/AnamnesisResultCard";
import ValoracionStepper from "../components/ValoracionStepper";

import "./AnamnesisGlobal.css";

function normalizarZonaParaNavegacion(zona) {
  const value = String(zona || "")
    .trim()
    .toUpperCase();

  if (!value) return null;
  if (value.includes("HOMBRO")) return "hombro";
  if (value.includes("RODILLA")) return "rodilla";
  if (value.includes("CADERA")) return "cadera";
  if (value.includes("ESPALDA") || value.includes("LUMBAR")) return "lumbar";
  if (value.includes("FUNCIONAL")) return "funcional";

  return String(zona || "")
    .trim()
    .toLowerCase();
}

function obtenerTodasLasZonasBase() {
  return ["hombro", "rodilla", "cadera", "lumbar"];
}

function obtenerZonasCambioDisponibles(clasificacionPaciente) {
  const preliminar = normalizarZonaParaNavegacion(
    clasificacionPaciente?.zonaDestino,
  );

  const secundaria = normalizarZonaParaNavegacion(
    clasificacionPaciente?.zonaSecundaria,
  );

  return obtenerTodasLasZonasBase().filter((zona) => {
    if (zona === preliminar) return false;
    if (zona === secundaria) return false;
    return true;
  });
}

function formatearNombreZona(zona) {
  const mapa = {
    hombro: "Hombro",
    rodilla: "Rodilla",
    cadera: "Cadera",
    lumbar: "Lumbar",
    funcional: "Funcional",
  };

  return mapa[zona] || zona;
}

function construirResultadoPorFlujo(evaluacionBase, clasificacionPaciente) {
  const flujo = clasificacionPaciente?.flujo;
  const zonaDestinoNormalizada = normalizarZonaParaNavegacion(
    clasificacionPaciente?.zonaDestino,
  );

  if (evaluacionBase.descartado) {
    return {
      ...evaluacionBase,
      siguientePaso: "revision_critica",
      mensajeResultado:
        "El paciente ha marcado criterios críticos que no permiten su clasificación al programa. Queda alertado para revisión.",
    };
  }

  if (flujo === "ANTIGUO_REINICIA_ZONA") {
    return {
      ...evaluacionBase,
      zonasDetectadas: zonaDestinoNormalizada ? [zonaDestinoNormalizada] : [],
      cantidadZonasDolor: zonaDestinoNormalizada ? 1 : 0,
      pendienteAprobacion: false,
      siguientePaso: "decision_reinicia_zona_o_cambio",
      mensajeResultado: "",
    };
  }

  if (flujo === "ANTIGUO_ELIGE_PRELIMINAR_O_SECUNDARIA") {
    return {
      ...evaluacionBase,
      zonasDetectadas: zonaDestinoNormalizada ? [zonaDestinoNormalizada] : [],
      cantidadZonasDolor: 0,
      pendienteAprobacion: false,
      siguientePaso: "decision_fotos_preliminar_o_secundaria",
      mensajeResultado: "",
    };
  }

  if (flujo === "ANTIGUO_ELIGE_PRELIMINAR_O_FUNCIONAL") {
    return {
      ...evaluacionBase,
      zonasDetectadas: zonaDestinoNormalizada ? [zonaDestinoNormalizada] : [],
      cantidadZonasDolor: 0,
      pendienteAprobacion: false,
      siguientePaso: "decision_fotos_preliminar_o_funcional",
      mensajeResultado: "",
    };
  }

  if (flujo === "ANTIGUO_DECIDE_CONTINUIDAD_O_CAMBIO") {
    return {
      ...evaluacionBase,
      zonasDetectadas: [],
      cantidadZonasDolor: 0,
      pendienteAprobacion: false,
      siguientePaso: "decision_antiguo_funcional_actual_o_cambio",
      mensajeResultado: "",
    };
  }

  if (flujo === "NUEVO_PROCESO") {
    if (evaluacionBase.pendienteAprobacion) {
      return evaluacionBase;
    }

    return {
      ...evaluacionBase,
      siguientePaso: "decision_zona_o_funcional",
      mensajeResultado: "",
    };
  }

  return evaluacionBase;
}

function limpiarCamposDolorSiOculto(formData, ocultarDeteccionDolor) {
  if (!ocultarDeteccionDolor) return formData;

  return {
    ...formData,
    dolor_rodilla: "NO",
    dolor_cadera: "NO",
    dolor_lumbar: "NO",
    dolor_hombro: "NO",
  };
}

export default function AnamnesisGlobal() {
  const navigate = useNavigate();
  const [resultado, setResultado] = useState(null);

  const valoracionActiva = useMemo(() => obtenerValoracionActiva(), []);
  const clasificacionPaciente = valoracionActiva?.clasificacionPaciente || null;

  const { formData, errores, setErrores, handleChange, resetForm } =
    useAnamnesisGlobalForm();

  const ocultarDeteccionDolor = !!clasificacionPaciente?.ocultarDeteccionDolor;

  const formDataNormalizado = useMemo(() => {
    return limpiarCamposDolorSiOculto(formData, ocultarDeteccionDolor);
  }, [formData, ocultarDeteccionDolor]);

  const seccionesVisibles = useMemo(() => {
    return anamnesisSections.filter((section) => {
      if (section.title === "4.3 Obesidad") {
        return false;
      }

      if (
        ocultarDeteccionDolor &&
        section.title === "5. Identificación de dolor"
      ) {
        return false;
      }

      return true;
    });
  }, [ocultarDeteccionDolor]);

  useEffect(() => {
    const hayInformacion = Object.values(formData).some((value) => {
      if (value === null || value === undefined) return false;
      return String(value).trim() !== "";
    });

    if (!hayInformacion) {
      limpiarAnamnesisGlobalDraft();
      return;
    }

    const timeout = setTimeout(() => {
      guardarAnamnesisGlobalDraft(formData);
    }, 400);

    return () => clearTimeout(timeout);
  }, [formData]);

  function irAFotos(zonaProtocoloFotos) {
    navigate("/herramientas/fotos-test", {
      state: {
        resultado,
        formData: formDataNormalizado,
        clasificacionPaciente,
        zonaProtocoloFotos,
        zonaSeleccionadaFinal: zonaProtocoloFotos,
      },
    });
  }

  function irAAnamnesisZona(zonaElegida, zonasDisponiblesCambio = []) {
    navigate("/herramientas/anamnesis-zona", {
      state: {
        zonasDetectadas: [zonaElegida],
        resultado,
        formData: formDataNormalizado,
        clasificacionPaciente,
        esCambioDiagnostico: true,
        zonasDisponiblesCambio,
        zonaSeleccionadaCambio: zonaElegida,
      },
    });
  }

  async function seleccionarZonaCambio(zonasDisponibles) {
    if (!Array.isArray(zonasDisponibles) || zonasDisponibles.length === 0) {
      return null;
    }

    if (zonasDisponibles.length === 1) {
      return zonasDisponibles[0];
    }

    if (zonasDisponibles.length === 2) {
      const [zonaA, zonaB] = zonasDisponibles;

      const elegirZonaA = await alertConfirm({
        title: "Seleccionar nueva zona",
        text: `¿Desea abrir la anamnesis de ${formatearNombreZona(zonaA)}?`,
        confirmText: `Sí, ${formatearNombreZona(zonaA)}`,
        cancelText: formatearNombreZona(zonaB),
      });

      return elegirZonaA ? zonaA : zonaB;
    }

    const [zonaA, zonaB, zonaC] = zonasDisponibles;

    const elegirZonaA = await alertConfirm({
      title: "Seleccionar nueva zona",
      text: `¿Desea abrir la anamnesis de ${formatearNombreZona(zonaA)}?`,
      confirmText: `Sí, ${formatearNombreZona(zonaA)}`,
      cancelText: "Ver otras opciones",
    });

    if (elegirZonaA) {
      return zonaA;
    }

    const elegirZonaB = await alertConfirm({
      title: "Seleccionar nueva zona",
      text: `¿Desea abrir la anamnesis de ${formatearNombreZona(zonaB)}?`,
      confirmText: `Sí, ${formatearNombreZona(zonaB)}`,
      cancelText: formatearNombreZona(zonaC),
    });

    return elegirZonaB ? zonaB : zonaC;
  }

  function handleSubmit(e) {
    e.preventDefault();

    const nuevosErrores = validarAnamnesisGlobal(formDataNormalizado);

    if (Object.keys(nuevosErrores).length > 0) {
      console.log("ocultarDeteccionDolor", ocultarDeteccionDolor);
      console.log("formDataNormalizado", formDataNormalizado);
      console.log("Errores anamnesis global:", nuevosErrores);

      setErrores(nuevosErrores);
      setResultado(null);

      alertError(
        "Formulario incompleto",
        "Debes responder todos los campos obligatorios antes de continuar.",
      );
      return;
    }

    const evaluacionBase = evaluarAnamnesisGlobal(formDataNormalizado);
    const evaluacionFinal = construirResultadoPorFlujo(
      evaluacionBase,
      clasificacionPaciente,
    );

    setErrores({});
    setResultado(evaluacionFinal);

    console.log("formData normalizado", formDataNormalizado);
    console.log("evaluacionAnamnesisGlobal", evaluacionFinal);
  }

  async function handleLimpiarTodaLaAnamnesis() {
    const hayInformacion = Object.values(formData).some((value) => {
      if (value === null || value === undefined) return false;
      return String(value).trim() !== "";
    });

    if (!hayInformacion && !resultado) {
      await alertError(
        "Nada para limpiar",
        "La anamnesis global ya está vacía.",
      );
      return;
    }

    const ok = await alertConfirm({
      title: "Limpiar anamnesis global",
      text: "Se borrarán todas las respuestas del formulario. ¿Deseas continuar?",
      confirmText: "Sí, limpiar",
      cancelText: "Cancelar",
    });

    if (!ok) return;

    resetForm();
    setResultado(null);
    limpiarAnamnesisGlobalDraft();
  }

  async function handleContinuar() {
    if (!resultado) return;

    if (resultado.siguientePaso === "revision_critica") {
      await alertError(
        "Paciente alertado para revisión",
        "El paciente ha marcado criterios críticos que no permiten su clasificación al programa.",
      );
      return;
    }

    const ok = await alertConfirm({
      title: "Guardar primera fase",
      text: "La anamnesis global quedará guardada y pasarás a la siguiente fase. ¿Deseas continuar?",
      confirmText: "Continuar",
      cancelText: "Seguir editando",
    });

    if (!ok) return;

    limpiarAnamnesisGlobalDraft();

    if (resultado.siguientePaso === "funcional") {
      irAFotos("funcional");
      return;
    }

    if (resultado.siguientePaso === "decision_reinicia_zona_o_cambio") {
      const deseaCambiar = await alertConfirm({
        title: "Cambio de zona",
        text: "¿Desea cambiar de zona diagnóstica por un dolor nuevo?",
        confirmText: "Sí, cambiar zona",
        cancelText: "No, continuar actual",
      });

      if (!deseaCambiar) {
        const zonaActual = normalizarZonaParaNavegacion(
          clasificacionPaciente?.zonaDestino,
        );

        irAFotos(zonaActual || "funcional");
        return;
      }

      const zonasDisponibles = obtenerZonasCambioDisponibles(
        clasificacionPaciente,
      );

      if (zonasDisponibles.length === 0) {
        await alertError(
          "Sin zonas disponibles",
          "No hay otras zonas disponibles para cambio de diagnóstico.",
        );

        const zonaActual = normalizarZonaParaNavegacion(
          clasificacionPaciente?.zonaDestino,
        );

        irAFotos(zonaActual || "funcional");
        return;
      }

      const zonaElegida = await seleccionarZonaCambio(zonasDisponibles);

      if (!zonaElegida) {
        const zonaActual = normalizarZonaParaNavegacion(
          clasificacionPaciente?.zonaDestino,
        );

        irAFotos(zonaActual || "funcional");
        return;
      }

      irAAnamnesisZona(zonaElegida, zonasDisponibles);
      return;
    }

    if (resultado.siguientePaso === "anamnesis_especifica_zona") {
      navigate("/herramientas/anamnesis-zona", {
        state: {
          zonasDetectadas: resultado.zonasDetectadas,
          resultado,
          formData: formDataNormalizado,
          clasificacionPaciente,
        },
      });
      return;
    }

    if (resultado.siguientePaso === "decision_fotos_preliminar_o_secundaria") {
      const activarSecundaria = await alertConfirm({
        title: "Definir continuidad terapéutica",
        text: "¿Desea continuar con el protocolo correspondiente a su zona preliminar o activar el protocolo de su segundo diagnóstico?",
        confirmText: "Activar segundo diagnóstico",
        cancelText: "Continuar zona preliminar",
      });

      if (activarSecundaria) {
        const zonaSecundaria = normalizarZonaParaNavegacion(
          clasificacionPaciente?.zonaSecundaria,
        );

        irAFotos(zonaSecundaria || "funcional");
        return;
      }

      const zonaPreliminar = normalizarZonaParaNavegacion(
        clasificacionPaciente?.zonaDestino,
      );

      irAFotos(zonaPreliminar || "funcional");
      return;
    }

    if (resultado.siguientePaso === "decision_fotos_preliminar_o_funcional") {
      const zonaEsFuncional =
        normalizarZonaParaNavegacion(clasificacionPaciente?.zonaDestino) ===
        "funcional";

      if (zonaEsFuncional) {
        irAFotos("funcional");
        return;
      }

      const avanzarAFuncional = await alertConfirm({
        title: "Definir continuidad terapéutica",
        text: "¿Desea continuar con el protocolo correspondiente a su zona preliminar o avanzar al protocolo funcional?",
        confirmText: "Avanzar a funcional",
        cancelText: "Continuar zona preliminar",
      });

      if (avanzarAFuncional) {
        irAFotos("funcional");
        return;
      }

      const zonaPreliminar = normalizarZonaParaNavegacion(
        clasificacionPaciente?.zonaDestino,
      );

      irAFotos(zonaPreliminar || "funcional");
      return;
    }

    if (
      resultado.siguientePaso === "decision_antiguo_funcional_actual_o_cambio"
    ) {
      const avanzarAFuncional = await alertConfirm({
        title: "Definir continuidad terapéutica",
        text: "¿Desea avanzar al protocolo funcional?",
        confirmText: "Sí, pasar a funcional",
        cancelText: "No",
      });

      if (avanzarAFuncional) {
        irAFotos("funcional");
        return;
      }

      const continuarActual = await alertConfirm({
        title: "Mantener diagnóstico actual",
        text: "¿Desea continuar con su diagnóstico actual?",
        confirmText: "Sí, continuar actual",
        cancelText: "No, evaluar cambio",
      });

      if (continuarActual) {
        const zonaActual = normalizarZonaParaNavegacion(
          clasificacionPaciente?.zonaDestino,
        );

        irAFotos(zonaActual || "funcional");
        return;
      }

      const deseaCambiar = await alertConfirm({
        title: "Cambio por dolor nuevo",
        text: "¿Desea cambiar de diagnóstico debido a un dolor nuevo?",
        confirmText: "Sí, cambiar",
        cancelText: "No",
      });

      if (!deseaCambiar) {
        const zonaActual = normalizarZonaParaNavegacion(
          clasificacionPaciente?.zonaDestino,
        );

        irAFotos(zonaActual || "funcional");
        return;
      }

      const zonasDisponibles = obtenerZonasCambioDisponibles(
        clasificacionPaciente,
      );

      if (zonasDisponibles.length === 0) {
        await alertError(
          "Sin zonas disponibles",
          "No hay otras zonas disponibles para cambio de diagnóstico.",
        );

        const zonaActual = normalizarZonaParaNavegacion(
          clasificacionPaciente?.zonaDestino,
        );

        irAFotos(zonaActual || "funcional");
        return;
      }

      const zonaElegida = await seleccionarZonaCambio(zonasDisponibles);

      if (!zonaElegida) {
        const zonaActual = normalizarZonaParaNavegacion(
          clasificacionPaciente?.zonaDestino,
        );

        irAFotos(zonaActual || "funcional");
        return;
      }

      irAAnamnesisZona(zonaElegida, zonasDisponibles);
      return;
    }

    if (resultado.siguientePaso === "decision_zona_o_funcional") {
      const tieneZonas = Array.isArray(resultado.zonasDetectadas)
        ? resultado.zonasDetectadas.length > 0
        : false;

      if (!tieneZonas) {
        irAFotos("funcional");
        return;
      }

      const avanzarAFuncional = await alertConfirm({
        title: "Definir continuidad terapéutica",
        text: "¿Desea continuar con la intervención en la zona identificada o avanzar a la fase funcional?",
        confirmText: "Avanzar a funcional",
        cancelText: "Continuar intervención específica",
      });

      if (avanzarAFuncional) {
        irAFotos("funcional");
        return;
      }

      navigate("/herramientas/anamnesis-zona", {
        state: {
          zonasDetectadas: resultado.zonasDetectadas,
          resultado,
          formData: formDataNormalizado,
          clasificacionPaciente,
        },
      });
    }
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
            onClick={() => navigate("/herramientas/valoracion")}
          >
            ← Volver
          </button>
        </div>

        <section className="valoracionHero">
          <h1 className="valoracionTitle">Anamnesis Global</h1>
          <p className="valoracionSubtitle">
            Paso 3. Evaluación clínica general del paciente
          </p>
        </section>

        <ValoracionStepper currentStep={3} />

        <section className="valoracionCard">
          <div className="valoracionCardHeader">
            <h2 className="valoracionCardTitle">Formulario clínico</h2>
            <p className="valoracionCardDescription">
              Aunque exista algún criterio de descarte, el paciente debe
              completar todo el módulo.
            </p>
          </div>

          <form className="valoracionForm" onSubmit={handleSubmit}>
            {seccionesVisibles.map((section) => (
              <AnamnesisSectionRenderer
                key={section.title}
                section={section}
                formData={formData}
                errores={errores}
                handleChange={handleChange}
                extraContent={null}
              />
            ))}

            <div className="valoracionActions">
              <button className="valoracionPrimaryBtn" type="submit">
                Evaluar anamnesis global
              </button>

              <button
                type="button"
                className="valoracionPrimaryBtn"
                onClick={handleLimpiarTodaLaAnamnesis}
                style={{
                  background: "linear-gradient(135deg, #163e8f, #1d4ed8)",
                  marginLeft: "10px",
                }}
              >
                Limpiar anamnesis
              </button>
            </div>
          </form>

          <AnamnesisResultCard
            resultado={resultado}
            clasificacionPaciente={clasificacionPaciente}
            onContinuar={handleContinuar}
          />
        </section>
      </main>
    </div>
  );
}
