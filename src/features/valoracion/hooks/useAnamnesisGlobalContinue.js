import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  alertConfirm,
  alertError,
  alertOk,
  alertSelect,
} from "../../../shared/lib/alerts";

import {
  ANAMNESIS_GLOBAL_UPLOAD_MODES,
  getAnamnesisGlobalUploadMode,
} from "../../../shared/lib/anamnesisGlobalUploadMode";

import { construirMensajeResultadoAnamnesisGlobal } from "../services/construirMensajeResultadoAnamnesisGlobal";
import { guardarAnamnesisGlobal } from "../services/guardarAnamnesisGlobal";
import { limpiarAnamnesisGlobalBorrador } from "../utils/anamnesisGlobalDraft";
import {
  construirOpcionesContinuidad,
  obtenerZonasCambioDisponibles,
} from "../utils/construirOpcionesContinuidad";
import { editarGlobalPorErrores } from "./editarGlobalporErrores";
import { resolverConflictoAnamnesisZonaAntesDeContinuar } from "./resolverConflictoAnamnesisZonaAntesDeContinuar";

function normalizarZonaClave(z) {
  return String(z ?? "")
    .trim()
    .toLowerCase();
}

/**
 * Paciente nuevo (o antiguo sin clasificación que retoma flujo nuevo): zonas de dolor de la evaluación.
 * Paciente antiguo: zona elegida en el menú de continuidad (fotos o anamnesis de zona).
 */
function armarZonasDetectadasYParaPayload({
  resultado,
  clasificacionPaciente,
  opcionContinuidad,
  zonasMultiAnamnesis,
}) {
  const esNuevo = clasificacionPaciente?.esPacienteNuevo === true;
  const tomaFlujoNuevoSinClasificacion =
    clasificacionPaciente?.flujo ===
    "ANTIGUO_SIN_CLASIFICACION_TOMA_FLUJO_NUEVO";

  if (esNuevo || tomaFlujoNuevoSinClasificacion) {
    const fuente =
      Array.isArray(zonasMultiAnamnesis) && zonasMultiAnamnesis.length > 0
        ? zonasMultiAnamnesis
        : resultado?.zonasDetectadas;
    const zonas = Array.isArray(fuente)
      ? fuente.map(normalizarZonaClave).filter(Boolean)
      : [];
    const cantidad = Number(resultado?.cantidadZonasDolor ?? zonas.length);
    return { zonas_detectadas: zonas, cantidad_zonas_dolor: cantidad };
  }

  const zSel = opcionContinuidad?.zona;
  if (zSel != null && String(zSel).trim() !== "") {
    const z = normalizarZonaClave(zSel);
    return {
      zonas_detectadas: z ? [z] : [],
      cantidad_zonas_dolor: z ? 1 : 0,
    };
  }

  const fallback = Array.isArray(resultado?.zonasDetectadas)
    ? resultado.zonasDetectadas.map(normalizarZonaClave).filter(Boolean)
    : [];
  return {
    zonas_detectadas: fallback,
    cantidad_zonas_dolor: Number(
      resultado?.cantidadZonasDolor ?? fallback.length,
    ),
  };
}

function armarAlertasParaPayload(resultado) {
  const raw = resultado?.alertas;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((a) => (a == null ? "" : String(a).trim()))
    .filter(Boolean);
}

export function useAnamnesisGlobalContinue({
  resultado,
  formDataNormalizado,
  clasificacionPaciente,
  valoracionActiva,
  profesional,
}) {
  const navigate = useNavigate();

  const pacienteActivo = valoracionActiva?.paciente || null;

  const cedulaPacienteActual = String(
    valoracionActiva?.paciente?.numero_documento_fisico ||
      valoracionActiva?.paciente?.num_documento ||
      valoracionActiva?.paciente?.cedula ||
      "",
  ).trim();

  const irAFotos = useCallback(
    (zonaProtocoloFotos) => {
      navigate("/herramientas/fotos-test", {
        state: {
          from: "/herramientas/anamnesis-zona",
          resultado,
          formData: formDataNormalizado,
          clasificacionPaciente,
          zonaProtocoloFotos,
          zonaSeleccionadaFinal: zonaProtocoloFotos,
          zonasProtocoloFotos: [zonaProtocoloFotos],
          profesional,
          paciente: pacienteActivo,
          cedula: cedulaPacienteActual,
        },
      });
    },
    [
      navigate,
      resultado,
      formDataNormalizado,
      clasificacionPaciente,
      profesional,
      pacienteActivo,
      cedulaPacienteActual,
    ],
  );

  const irAAnamnesisZona = useCallback(
    (zonaElegida, zonasDisponiblesCambio = []) => {
      const pacienteActivo = valoracionActiva?.paciente || null;

      const cedulaPacienteActual =
        valoracionActiva?.paciente?.numero_documento_fisico ||
        valoracionActiva?.paciente?.num_documento ||
        valoracionActiva?.paciente?.cedula ||
        "";

      navigate("/herramientas/anamnesis-zona", {
        state: {
          from: "/herramientas/anamnesis-global",
          zonaSeleccionadaFinal: zonaElegida,
          zonasDetectadas: [zonaElegida],
          zonasProtocoloFotos: [zonaElegida],
          resultado,
          formData: formDataNormalizado,
          clasificacionPaciente,
          esCambioDiagnostico: true,
          zonasDisponiblesCambio,
          zonaSeleccionadaCambio: zonaElegida,
          paciente: pacienteActivo,
          profesional,
          cedula: cedulaPacienteActual,
        },
      });
    },
    [
      navigate,
      resultado,
      formDataNormalizado,
      clasificacionPaciente,
      valoracionActiva,
      profesional,
    ],
  );

  const irAAnamnesisZonaDirecta = useCallback(
    (zonasDetectadas = []) => {
      const zonasLimpias = Array.isArray(zonasDetectadas)
        ? zonasDetectadas.filter(Boolean)
        : [];

      const zonaPrincipal = zonasLimpias[0] || null;

      const pacienteActivo = valoracionActiva?.paciente || null;

      const cedulaPacienteActual =
        valoracionActiva?.paciente?.numero_documento_fisico ||
        valoracionActiva?.paciente?.num_documento ||
        valoracionActiva?.paciente?.cedula ||
        "";

      navigate("/herramientas/anamnesis-zona", {
        state: {
          from: "/herramientas/anamnesis-global",

          zonasDetectadas: zonasLimpias,
          zonaSeleccionadaFinal: zonaPrincipal,
          zonasProtocoloFotos: zonaPrincipal ? [zonaPrincipal] : [],

          resultado,
          formData: formDataNormalizado,
          clasificacionPaciente,

          esCambioDiagnostico: false,
          zonasDisponiblesCambio: [],
          zonaSeleccionadaCambio: null,

          paciente: pacienteActivo,
          profesional,
          cedula: cedulaPacienteActual,
        },
      });
    },
    [
      navigate,
      resultado,
      formDataNormalizado,
      clasificacionPaciente,
      valoracionActiva,
      profesional,
    ],
  );
  const handleContinuar = useCallback(async () => {
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
      let decisionEdicion = null;

      if (!cedulaPacienteActual) {
        await alertError(
          "Paciente no identificado",
          "No fue posible identificar la cédula del paciente para guardar la anamnesis global.",
        );
        return;
      }

      const esPacienteNuevo = Boolean(clasificacionPaciente?.esPacienteNuevo);
      const tomaFlujoNuevoPorHistorial =
        clasificacionPaciente?.flujo ===
        "ANTIGUO_SIN_CLASIFICACION_TOMA_FLUJO_NUEVO";

      const zonasDetectadas = Array.isArray(resultado?.zonasDetectadas)
        ? resultado.zonasDetectadas.filter(Boolean)
        : [];

      let opcionContinuidad = null;
      let zonasMultiAnamnesis = null;

      if (
        (esPacienteNuevo || tomaFlujoNuevoPorHistorial) &&
        zonasDetectadas.length > 0
      ) {
        zonasMultiAnamnesis = zonasDetectadas;
        opcionContinuidad = {
          tipo: "anamnesis_zona",
          zona: zonasDetectadas[0],
        };
      } else {
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
          opcionContinuidad = opcionesContinuidad[0];
        } else {
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

          opcionContinuidad =
            opcionesContinuidad.find((opcion) => opcion.value === seleccion) ||
            null;

          if (!opcionContinuidad) {
            await alertError(
              "Selección inválida",
              "No se pudo identificar la opción seleccionada.",
            );
            return;
          }
        }
      }

      if (mode === ANAMNESIS_GLOBAL_UPLOAD_MODES.REAL) {
        decisionEdicion = await editarGlobalPorErrores(
          cedulaPacienteActual,
          resultado,
        );

        if (!decisionEdicion.puedeContinuar) {
          return;
        }
      }

      const validarAntesDeNavegar = async (zonaFinal) => {
        if (!decisionEdicion || mode !== ANAMNESIS_GLOBAL_UPLOAD_MODES.REAL) {
          return {
            puedeContinuar: true,
            continuarConExistente: false,
          };
        }

        const conflicto = await resolverConflictoAnamnesisZonaAntesDeContinuar({
          numeroDocumento: cedulaPacienteActual,
          zonaNueva: zonaFinal,
        });

        if (!conflicto.puedeContinuar) {
          return {
            puedeContinuar: false,
            continuarConExistente: false,
          };
        }

        return {
          puedeContinuar: true,
          continuarConExistente: conflicto.accion === "continuar_existente",
        };
      };

      const decisionNavegacion = await validarAntesDeNavegar(
        opcionContinuidad.zona,
      );

      if (!decisionNavegacion.puedeContinuar) {
        return;
      }

      if (decisionNavegacion.continuarConExistente) {
        return;
      }

      const mensajeResultado = construirMensajeResultadoAnamnesisGlobal({
        clasificacionPaciente,
        opcion: zonasMultiAnamnesis ? null : opcionContinuidad,
        zonasMultiAnamnesis,
      });

      const { zonas_detectadas, cantidad_zonas_dolor } =
        armarZonasDetectadasYParaPayload({
          resultado,
          clasificacionPaciente,
          opcionContinuidad,
          zonasMultiAnamnesis,
        });

      const alertasGuardado = armarAlertasParaPayload(resultado);

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

        alertas: alertasGuardado,
        descartado: Boolean(resultado.descartado),
        motivos_descarte: Array.isArray(resultado.motivosDescarte)
          ? [...resultado.motivosDescarte]
          : [],
        zonas_detectadas,
        cantidad_zonas_dolor,
        pendiente_aprobacion: Boolean(resultado.pendienteAprobacion),
        siguiente_paso: resultado.siguientePaso || null,
        mensaje_resultado: mensajeResultado,
      };

      if (mode === ANAMNESIS_GLOBAL_UPLOAD_MODES.REAL) {
        await guardarAnamnesisGlobal(payload);

        await alertOk(
          decisionEdicion.cambioRutaDetectado
            ? "Ruta re-evaluada correctamente"
            : decisionEdicion.debeSobrescribir
              ? "Anamnesis global reemplazada"
              : "Anamnesis global guardada",
          decisionEdicion.cambioRutaDetectado
            ? "Se detectó un cambio en la ruta del paciente y la nueva decisión fue aplicada correctamente."
            : decisionEdicion.debeSobrescribir
              ? "La ruta previa del paciente fue reemplazada correctamente."
              : "La anamnesis global fue guardada correctamente en base de datos.",
        );

        limpiarAnamnesisGlobalBorrador();
      } else {
        await alertOk(
          "Modo simulación",
          "La anamnesis global no se guardó en base de datos porque el módulo está en simulación.",
        );
      }

      if (zonasMultiAnamnesis) {
        await alertOk(
          "Continuación definida",
          "Iniciaremos la anamnesis de las zonas seleccionadas.",
        );

        irAAnamnesisZonaDirecta(zonasMultiAnamnesis);
        return;
      }

      if (opcionContinuidad.tipo === "fotos") {
        irAFotos(opcionContinuidad.zona || "funcional");
        return;
      }

      if (opcionContinuidad.tipo === "anamnesis_zona") {
        irAAnamnesisZona(
          opcionContinuidad.zona,
          opcionContinuidad.zonasDisponiblesCambio ||
            obtenerZonasCambioDisponibles(clasificacionPaciente),
        );
        return;
      }

      await alertError(
        "Ruta no disponible",
        "La opción elegida no tiene una navegación válida.",
      );
    } catch (error) {
      console.error("Error guardando anamnesis global:", error);

      await alertError(
        "Error al guardar anamnesis global",
        error?.message || "No fue posible guardar la anamnesis global.",
      );
    }
  }, [
    resultado,
    formDataNormalizado,
    clasificacionPaciente,
    valoracionActiva,
    profesional,
    navigate,
    irAFotos,
    irAAnamnesisZona,
    irAAnamnesisZonaDirecta,
    pacienteActivo,
    cedulaPacienteActual,
  ]);

  return {
    handleContinuar,
  };
}
