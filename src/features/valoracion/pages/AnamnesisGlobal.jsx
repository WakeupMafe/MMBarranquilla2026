import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import logoWakeup from "../../../assets/LogoWakeup.png";
import { alertConfirm, alertError } from "../../../shared/lib/alerts";

import { anamnesisSections } from "../config/anamnesisSections";
import {
  calcularImc,
  evaluarAnamnesisGlobal,
} from "../services/anamnesisGlobalRules";
import { validarAnamnesisGlobal } from "../services/validarAnamnesisGlobal";
import { guardarAnamnesisGlobalDraft } from "../utils/anamnesisGlobalDraft";
import { obtenerValoracionActiva } from "../utils/valoracionSession";
import { useAnamnesisGlobalForm } from "../hooks/useAnamnesisGlobalForm";
import AnamnesisSectionRenderer from "../components/AnamnesisSectionRenderer";
import AnamnesisResultCard from "../components/AnamnesisResultCard";

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

  // ANTIGUO que no cumplió: directo a fotos de su zona preliminar
  if (flujo === "ANTIGUO_REINICIA_ZONA") {
    return {
      ...evaluacionBase,
      zonasDetectadas: zonaDestinoNormalizada ? [zonaDestinoNormalizada] : [],
      cantidadZonasDolor: zonaDestinoNormalizada ? 1 : 0,
      pendienteAprobacion: false,
      siguientePaso: "fotos_zona_antiguo",
      mensajeResultado: "",
    };
  }

  // ANTIGUO que cumplió y tiene secundaria: elegir preliminar o secundaria, pero ambos van a fotos
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

  // ANTIGUO que cumplió y no tiene secundaria: elegir preliminar o funcional, ambos van a fotos
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

  // NUEVO: puede elegir continuar zona o funcional
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

export default function AnamnesisGlobal() {
  const navigate = useNavigate();
  const [resultado, setResultado] = useState(null);

  const valoracionActiva = useMemo(() => obtenerValoracionActiva(), []);
  const clasificacionPaciente = valoracionActiva?.clasificacionPaciente || null;

  const { formData, errores, setErrores, handleChange } =
    useAnamnesisGlobalForm();

  const { imc, obesidad } = useMemo(() => {
    return calcularImc(formData.peso, formData.talla);
  }, [formData.peso, formData.talla]);

  const ocultarDeteccionDolor = !!clasificacionPaciente?.ocultarDeteccionDolor;

  const seccionesVisibles = useMemo(() => {
    return anamnesisSections.filter((section) => {
      if (
        ocultarDeteccionDolor &&
        section.title === "5. Identificación de dolor"
      ) {
        return false;
      }
      return true;
    });
  }, [ocultarDeteccionDolor]);

  function irAFotos(zonaProtocoloFotos) {
    navigate("/herramientas/fotos-test", {
      state: {
        resultado,
        formData,
        clasificacionPaciente,
        zonaProtocoloFotos: zonaElegida,
        zonaSeleccionadaFinal: zonaElegida,
      },
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const nuevosErrores = validarAnamnesisGlobal(formData);

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      setResultado(null);

      alertError(
        "Formulario incompleto",
        "Debes responder todos los campos obligatorios antes de continuar.",
      );
      return;
    }

    const evaluacionBase = evaluarAnamnesisGlobal(formData);
    const evaluacionFinal = construirResultadoPorFlujo(
      evaluacionBase,
      clasificacionPaciente,
    );

    setErrores({});
    setResultado(evaluacionFinal);

    console.log("formData", formData);
    console.log("evaluacionAnamnesisGlobal", evaluacionFinal);
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

    guardarAnamnesisGlobalDraft(formData);

    if (resultado.siguientePaso === "funcional") {
      irAFotos("funcional");
      return;
    }

    // ANTIGUO: directo a fotos de la zona preliminar
    if (resultado.siguientePaso === "fotos_zona_antiguo") {
      const zonaPreliminar = normalizarZonaParaNavegacion(
        clasificacionPaciente?.zonaDestino,
      );

      irAFotos(zonaPreliminar || "funcional");
      return;
    }

    // NUEVO: sí puede ir a anamnesis de zona
    if (resultado.siguientePaso === "anamnesis_especifica_zona") {
      navigate("/herramientas/anamnesis-zona", {
        state: {
          zonasDetectadas: resultado.zonasDetectadas,
          resultado,
          formData,
          clasificacionPaciente,
        },
      });
      return;
    }

    // ANTIGUO: elegir entre preliminar o segundo diagnóstico, ambos directos a fotos
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

    // ANTIGUO: elegir entre preliminar o funcional, ambos directos a fotos
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

    // NUEVO: si tiene zona puede elegir zona o funcional
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
          formData,
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
            Paso 2. Evaluación clínica general del paciente
          </p>
        </section>

        <section className="valoracionStepper" aria-label="Progreso">
          <div className="stepItem">
            <span className="stepNumber">1</span>
            <span className="stepText">Datos generales</span>
          </div>

          <div className="stepItem stepItem--active">
            <span className="stepNumber">2</span>
            <span className="stepText">Anamnesis global</span>
          </div>

          <div className="stepItem">
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
                extraContent={
                  section.title === "4.3 Obesidad" ? (
                    <div className="anamnesisInfoBox">
                      <p>
                        <strong>IMC:</strong> {imc ?? "Sin calcular"}
                      </p>
                      <p>
                        <strong>Obesidad:</strong> {obesidad ? "Sí" : "No"}
                      </p>
                    </div>
                  ) : null
                }
              />
            ))}

            <div className="valoracionActions">
              <button className="valoracionPrimaryBtn" type="submit">
                Evaluar anamnesis global
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
