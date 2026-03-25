import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import logoWakeup from "../../../assets/LogoWakeup.png";
import {
  alertConfirm,
  alertError,
  alertOk,
  alertSelect,
} from "../../../shared/lib/alerts";
import {
  construirOpcionesContinuidad,
  obtenerZonasCambioDisponibles,
} from "../utils/construirOpcionesContinuidad";
import useProfesionalSession from "../../../shared/hooks/useProfesionalSession";

import { anamnesisSections } from "../config/anamnesisSections";
import { evaluarAnamnesisGlobal } from "../services/anamnesisGlobalRules";
import { validarAnamnesisGlobal } from "../services/validarAnamnesisGlobal";
import {
  ANAMNESIS_GLOBAL_UPLOAD_MODES,
  getAnamnesisGlobalUploadMode,
} from "../../../shared/lib/anamnesisGlobalUploadMode";
import { guardarAnamnesisGlobal } from "../services/guardarAnamnesisGlobal";
import {
  guardarAnamnesisGlobalDraft,
  limpiarAnamnesisGlobalDraft,
} from "../utils/anamnesisGlobalDraft";
import { obtenerValoracionActiva } from "../utils/valoracionSession";
import { useAnamnesisGlobalForm } from "../hooks/useAnamnesisGlobalForm";
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

  const { profesional } = useProfesionalSession();

  const valoracionActiva = useMemo(() => obtenerValoracionActiva(), []);
  const clasificacionPaciente = valoracionActiva?.clasificacionPaciente || null;

  const cedulaPaciente = useMemo(() => {
    return String(
      valoracionActiva?.paciente?.numero_documento_fisico ||
        valoracionActiva?.paciente?.num_documento ||
        valoracionActiva?.paciente?.cedula ||
        "",
    ).trim();
  }, [valoracionActiva]);

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
    const pacienteActivo = valoracionActiva?.paciente || null;

    const cedulaPacienteActual =
      valoracionActiva?.paciente?.numero_documento_fisico ||
      valoracionActiva?.paciente?.num_documento ||
      valoracionActiva?.paciente?.cedula ||
      "";

    navigate("/herramientas/fotos-test", {
      state: {
        resultado,
        formData: formDataNormalizado,
        clasificacionPaciente,
        zonaProtocoloFotos,
        zonaSeleccionadaFinal: zonaProtocoloFotos,
        profesional,
        paciente: pacienteActivo,
        cedula: cedulaPacienteActual,
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

    try {
      const mode = getAnamnesisGlobalUploadMode();

      const cedulaPacienteActual = String(
        valoracionActiva?.paciente?.numero_documento_fisico ||
          valoracionActiva?.paciente?.num_documento ||
          valoracionActiva?.paciente?.cedula ||
          "",
      ).trim();

      if (!cedulaPacienteActual) {
        await alertError(
          "Paciente no identificado",
          "No fue posible identificar la cédula del paciente para guardar la anamnesis global.",
        );
        return;
      }

      const payload = {
        numero_documento_fisico: cedulaPacienteActual,

        horas_sueno: formDataNormalizado.horas_sueno || null,
        horas_sentado: formDataNormalizado.horas_sentado || null,
        horas_movimiento: formDataNormalizado.horas_movimiento || null,

        diabetes: formDataNormalizado.diabetes || null,
        diabetes_tratamiento: formDataNormalizado.diabetes_tratamiento || null,
        hipertension: formDataNormalizado.hipertension || null,
        hipertension_tratamiento:
          formDataNormalizado.hipertension_tratamiento || null,
        colesterol_alto: formDataNormalizado.colesterol_alto || null,
        colesterol_tratamiento:
          formDataNormalizado.colesterol_tratamiento || null,

        infarto: formDataNormalizado.infarto || null,
        infarto_menos_3_meses:
          formDataNormalizado.infarto_menos_3_meses || null,
        evento_cerebrovascular:
          formDataNormalizado.evento_cerebrovascular || null,
        ecv_menos_6_meses: formDataNormalizado.ecv_menos_6_meses || null,

        enfermedad_higado: formDataNormalizado.enfermedad_higado || null,
        enfermedad_rinon: formDataNormalizado.enfermedad_rinon || null,
        anemia: formDataNormalizado.anemia || null,
        anemia_controlada: formDataNormalizado.anemia_controlada || null,
        enfermedad_autoinmune:
          formDataNormalizado.enfermedad_autoinmune || null,
        enfermedad_psiquiatrica:
          formDataNormalizado.enfermedad_psiquiatrica || null,
        cancer_ultimos_5_anos:
          formDataNormalizado.cancer_ultimos_5_anos || null,

        cirugia_rodilla: formDataNormalizado.cirugia_rodilla || null,
        cirugia_cadera: formDataNormalizado.cirugia_cadera || null,
        cirugia_hombro: formDataNormalizado.cirugia_hombro || null,
        cirugia_columna: formDataNormalizado.cirugia_columna || null,
        cirugia_pelvis: formDataNormalizado.cirugia_pelvis || null,
        cirugia_otra: formDataNormalizado.cirugia_otra || null,
        cirugia_otra_cual: formDataNormalizado.cirugia_otra_cual || null,
        cirugia_menos_3_meses:
          formDataNormalizado.cirugia_menos_3_meses || null,

        golpe_pelvis: formDataNormalizado.golpe_pelvis || null,
        dolor_pelvis_nivel: formDataNormalizado.dolor_pelvis_nivel || null,

        paso_uci: formDataNormalizado.paso_uci || null,
        uci_menos_1_ano: formDataNormalizado.uci_menos_1_ano || null,
        razon_uci: formDataNormalizado.razon_uci || null,

        quimioterapia: formDataNormalizado.quimioterapia || null,
        radioterapia: formDataNormalizado.radioterapia || null,

        fuma: formDataNormalizado.fuma || null,
        cigarrillos_dia: formDataNormalizado.cigarrillos_dia || null,
        toma_licor: formDataNormalizado.toma_licor || null,
        frecuencia_licor: formDataNormalizado.frecuencia_licor || null,

        dolor_rodilla: formDataNormalizado.dolor_rodilla || null,
        dolor_cadera: formDataNormalizado.dolor_cadera || null,
        dolor_lumbar: formDataNormalizado.dolor_lumbar || null,
        dolor_hombro: formDataNormalizado.dolor_hombro || null,

        dx_artrosis_rodilla: formDataNormalizado.dx_artrosis_rodilla || null,
        dx_artrosis_cadera: formDataNormalizado.dx_artrosis_cadera || null,
        dx_lumbalgia_cronica: formDataNormalizado.dx_lumbalgia_cronica || null,
        dx_manguito_rotador: formDataNormalizado.dx_manguito_rotador || null,

        alertas: resultado.alertas || [],
        descartado: Boolean(resultado.descartado),
        motivos_descarte: resultado.motivosDescarte || [],
        zonas_detectadas: resultado.zonasDetectadas || [],
        cantidad_zonas_dolor: Number(resultado.cantidadZonasDolor || 0),
        pendiente_aprobacion: Boolean(resultado.pendienteAprobacion),
        siguiente_paso: resultado.siguientePaso || null,
        mensaje_resultado: resultado.mensajeResultado || null,
      };

      if (mode === ANAMNESIS_GLOBAL_UPLOAD_MODES.REAL) {
        await guardarAnamnesisGlobal(payload);

        await alertOk(
          "Anamnesis global guardada",
          "La anamnesis global fue guardada correctamente en base de datos.",
        );
      } else {
        await alertOk(
          "Modo simulación",
          "La anamnesis global no se guardó en base de datos porque el módulo está en simulación.",
        );
      }

      limpiarAnamnesisGlobalDraft();

      const opcionesContinuidad = construirOpcionesContinuidad({
        resultado,
        clasificacionPaciente,
      });

      if (!opcionesContinuidad.length) {
        await alertError(
          "Ruta no disponible",
          "No se encontraron opciones de continuidad para este paciente.",
        );
        return;
      }

      if (opcionesContinuidad.length === 1) {
        const unica = opcionesContinuidad[0];

        if (unica.tipo === "fotos") {
          irAFotos(unica.zona || "funcional");
          return;
        }

        if (unica.tipo === "anamnesis_zona") {
          irAAnamnesisZona(
            unica.zona,
            unica.zonasDisponiblesCambio ||
              obtenerZonasCambioDisponibles(clasificacionPaciente),
          );
          return;
        }

        if (unica.tipo === "anamnesis_zona_detectada") {
          navigate("/herramientas/anamnesis-zona", {
            state: {
              zonasDetectadas:
                unica.zonasDetectadas || resultado.zonasDetectadas || [],
              resultado,
              formData: formDataNormalizado,
              clasificacionPaciente,
            },
          });
          return;
        }

        await alertError(
          "Ruta no disponible",
          "La opción encontrada no tiene una navegación válida.",
        );
        return;
      }

      const inputOptions = Object.fromEntries(
        opcionesContinuidad.map((opcion) => [opcion.value, opcion.label]),
      );

      const seleccion = await alertSelect({
        title: "Definir continuidad terapéutica",
        text: "Selecciona cómo deseas continuar con este paciente.",
        inputOptions,
        inputPlaceholder: "Selecciona una opción",
        confirmButtonText: "Continuar",
        cancelButtonText: "Cancelar",
      });

      if (!seleccion) {
        return;
      }

      const opcionElegida =
        opcionesContinuidad.find((opcion) => opcion.value === seleccion) ||
        null;

      if (!opcionElegida) {
        await alertError(
          "Selección inválida",
          "No se pudo identificar la opción seleccionada.",
        );
        return;
      }

      if (opcionElegida.tipo === "fotos") {
        irAFotos(opcionElegida.zona || "funcional");
        return;
      }

      if (opcionElegida.tipo === "anamnesis_zona") {
        irAAnamnesisZona(
          opcionElegida.zona,
          opcionElegida.zonasDisponiblesCambio ||
            obtenerZonasCambioDisponibles(clasificacionPaciente),
        );
        return;
      }

      if (opcionElegida.tipo === "anamnesis_zona_detectada") {
        navigate("/herramientas/anamnesis-zona", {
          state: {
            zonasDetectadas:
              opcionElegida.zonasDetectadas || resultado.zonasDetectadas || [],
            resultado,
            formData: formDataNormalizado,
            clasificacionPaciente,
          },
        });
        return;
      }

      await alertError(
        "Ruta no disponible",
        "La opción seleccionada no tiene una ruta válida.",
      );
    } catch (error) {
      console.error("Error guardando anamnesis global:", error);

      await alertError(
        "Error al guardar anamnesis global",
        error?.message || "No fue posible guardar la anamnesis global.",
      );
    }
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
