import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import logoWakeup from "../../../assets/LogoWakeup.png";
import { alertConfirm, alertError } from "../../../shared/lib/alerts";
import useProfesionalSession from "../../../shared/hooks/useProfesionalSession";

import { anamnesisSections } from "../config/anamnesisSections";
import { evaluarAnamnesisGlobal } from "../services/anamnesisGlobalRules";
import { validarAnamnesisGlobal } from "../services/validarAnamnesisGlobal";
import {
  guardarAnamnesisGlobalDraft,
  limpiarAnamnesisGlobalDraft,
} from "../utils/anamnesisGlobalDraft";
import { obtenerValoracionActiva } from "../utils/valoracionSession";
import { useAnamnesisGlobalForm } from "../hooks/useAnamnesisGlobalForm";
import { useAnamnesisGlobalContinue } from "../hooks/useAnamnesisGlobalContinue";
import AnamnesisSectionRenderer from "../components/AnamnesisSectionRenderer";
import AnamnesisResultCard from "../components/AnamnesisResultCard";
import ValoracionStepper from "../components/ValoracionStepper";
import BotonImportante from "../../../shared/components/BotonImportante/BotonImportante";

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

  if (flujo === "ANTIGUO_FUNCIONAL_O_CAMBIO") {
    return {
      ...evaluacionBase,
      zonasDetectadas: [],
      cantidadZonasDolor: 0,
      pendienteAprobacion: false,
      siguientePaso: "decision_funcional_actual_o_cambio",
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
    return evaluacionBase;
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

  const { profesional } = useProfesionalSession();

  const valoracionActiva = useMemo(() => obtenerValoracionActiva(), []);
  const clasificacionPaciente = valoracionActiva?.clasificacionPaciente || null;

  // Mostrar la valoracion del paciente (Nuevo / Antiguo)
  console.log("valoracionActiva desde session", valoracionActiva);
  console.log(
    "clasificacionPaciente en AnamnesisGlobal",
    clasificacionPaciente,
  );
  console.log(
    "esPacienteNuevo en AnamnesisGlobal",
    clasificacionPaciente?.esPacienteNuevo,
  );
  console.log("flujo en AnamnesisGlobal", clasificacionPaciente?.flujo);

  const { formData, errores, setErrores, handleChange, resetForm } =
    useAnamnesisGlobalForm();

  const ocultarDeteccionDolor = !!clasificacionPaciente?.ocultarDeteccionDolor;

  const formDataNormalizado = useMemo(
    () => limpiarCamposDolorSiOculto(formData, ocultarDeteccionDolor),
    [formData, ocultarDeteccionDolor],
  );

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

  const { handleContinuar } = useAnamnesisGlobalContinue({
    resultado,
    formDataNormalizado,
    clasificacionPaciente,
    valoracionActiva,
    profesional,
  });

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

  return (
    <div className="valoracionShell">
      <TopHeader
        userName={profesional?.nombre || "Profesional"}
        onLogout={() => navigate("/")}
        logoSrc={logoWakeup}
      />

      <main className="valoracionPage">
        <div className="valoracionTopActions">
          <BotonImportante
            variant="ghost"
            className="valoracionBackBtnFix"
            onClick={() => navigate("/herramientas/valoracion")}
          >
            <span style={{ fontSize: "16px" }}>←</span>
            <span>Volver</span>
          </BotonImportante>
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

            <div className="valoracionActionsResponsive">
              <BotonImportante type="submit" variant="solid" fullWidth>
                Evaluar anamnesis global
              </BotonImportante>

              <BotonImportante
                type="button"
                variant="outline"
                fullWidth
                onClick={handleLimpiarTodaLaAnamnesis}
              >
                Limpiar anamnesis
              </BotonImportante>
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
