import { supabase } from "../../../shared/lib/supabaseClient";
import {
  mismoDocumentoBd,
  normalizarDocumentoCkin,
} from "../config/validarCedulaCkin";
import {
  esClasificacionSecundariaValida,
  evaluarObjetivosEncuesta,
} from "./valoracionRules";
import {
  extraerZonasCanonDesdePatologiaRelacionada,
  mapearPatologiaRelacionadaAZona,
} from "../utils/mapearPatologiaRelacionadaAZona";

let asistenciaSelectIncluyePatologiaRelacionada = true;

/** Mínimo de asistencias contadas para considerar cumplida la regla (columna `asistencias`). */
const UMBRAL_ASISTENCIAS = 20;

function normalizarTexto(valor) {
  return String(valor || "").trim();
}

function tieneTexto(valor) {
  return normalizarTexto(valor).length > 0;
}

/**
 * encuesta2.cedula es entero en BD: PostgREST debe recibir número (no string "123").
 * No usar ilike (no aplica a columnas integer/bigint).
 */
async function obtenerFilaEncuesta2PorCedulaEntera({
  tabla,
  columnaDocumento,
  columnasSelect,
  documentoNormalizado,
  mensajeError,
}) {
  const soloDigitos = String(documentoNormalizado).replace(/\D/g, "");
  if (!soloDigitos) return null;

  const cedulaNumerica = Number(soloDigitos);
  if (!Number.isFinite(cedulaNumerica) || !Number.isInteger(cedulaNumerica)) {
    return null;
  }

  // INTEGER: el cliente debe enviar número JSON. BIGINT muy largo: filtro como string de dígitos.
  const valorFiltro = Number.isSafeInteger(cedulaNumerica)
    ? cedulaNumerica
    : soloDigitos;

  const { data: filas, error } = await supabase
    .from(tabla)
    .select(columnasSelect)
    .eq(columnaDocumento, valorFiltro)
    .limit(1);

  if (error) {
    throw new Error(error.message || mensajeError);
  }

  return filas?.[0] ?? null;
}

/**
 * num_documento / numero_documento son VARCHAR: eq con string + ilike tolerante.
 */
async function obtenerFilaPorDocumentoVarchar({
  tabla,
  columnaDocumento,
  columnasSelect,
  documentoNormalizado,
  mensajeError,
}) {
  const docStr = String(documentoNormalizado);

  const { data: filasExactas, error } = await supabase
    .from(tabla)
    .select(columnasSelect)
    .eq(columnaDocumento, docStr)
    .limit(1);

  if (error) {
    throw new Error(error.message || mensajeError);
  }

  let fila = filasExactas?.[0] ?? null;

  if (!fila) {
    const sinCeros = docStr.replace(/^0+/, "") || docStr;
    if (sinCeros !== docStr) {
      const { data: filasAlt, error: errAlt } = await supabase
        .from(tabla)
        .select(columnasSelect)
        .eq(columnaDocumento, sinCeros)
        .limit(1);

      if (errAlt) {
        throw new Error(errAlt.message || mensajeError);
      }
      fila = filasAlt?.[0] ?? null;
    }
  }

  if (fila) return fila;

  const { data: candidatos, error: errorTolerante } = await supabase
    .from(tabla)
    .select(columnasSelect)
    .ilike(columnaDocumento, `%${docStr}%`)
    .limit(120);

  if (errorTolerante) {
    throw new Error(errorTolerante.message || mensajeError);
  }

  return (
    (candidatos || []).find((row) =>
      mismoDocumentoBd(row?.[columnaDocumento], documentoNormalizado),
    ) || null
  );
}

export async function buscarClasificacionPaciente(numeroDocumento) {
  const documentoNormalizado = normalizarDocumentoCkin(numeroDocumento);

  if (!documentoNormalizado) {
    throw new Error("El número de documento es obligatorio");
  }

  const valoracion = await obtenerFilaPorDocumentoVarchar({
    tabla: "valoraciones_fisioterapia",
    columnaDocumento: "num_documento",
    columnasSelect:
      "num_documento, clasificacion_preliminar, clasificacion_secundaria",
    documentoNormalizado,
    mensajeError: "No se pudo consultar la valoración física",
  });

  const columnasAsistenciaConPatologia =
    "numero_documento, asistencias, total_dias, patologia_relacionada";
  const columnasAsistenciaBase = "numero_documento, asistencias, total_dias";

  let asistencia;
  try {
    asistencia = await obtenerFilaPorDocumentoVarchar({
      tabla: "asistencia",
      columnaDocumento: "numero_documento",
      columnasSelect: asistenciaSelectIncluyePatologiaRelacionada
        ? columnasAsistenciaConPatologia
        : columnasAsistenciaBase,
      documentoNormalizado,
      mensajeError: "No se pudo consultar la asistencia del paciente",
    });
  } catch (errAsistencia) {
    const msg = String(errAsistencia?.message || "");
    if (
      asistenciaSelectIncluyePatologiaRelacionada &&
      (msg.includes("patologia_relacionada") ||
        msg.includes("does not exist"))
    ) {
      asistenciaSelectIncluyePatologiaRelacionada = false;
      asistencia = await obtenerFilaPorDocumentoVarchar({
        tabla: "asistencia",
        columnaDocumento: "numero_documento",
        columnasSelect: columnasAsistenciaBase,
        documentoNormalizado,
        mensajeError: "No se pudo consultar la asistencia del paciente",
      });
    } else {
      throw errAsistencia;
    }
  }

  const encuesta2 = await obtenerFilaEncuesta2PorCedulaEntera({
    tabla: "encuesta2",
    columnaDocumento: "cedula",
    columnasSelect:
      "cedula, obj1_original, obj1_nuevo, obj2_original, obj2_nuevo, obj3_original, obj3_nuevo",
    documentoNormalizado,
    mensajeError: "No se pudo consultar la encuesta de logros",
  });

  const preliminarCruda = String(
    valoracion?.clasificacion_preliminar ?? "",
  ).trim();
  const secundariaCruda = String(
    valoracion?.clasificacion_secundaria ?? "",
  ).trim();

  const preliminarDesdeValoracion = normalizarTexto(
    valoracion?.clasificacion_preliminar,
  );
  const tienePreliminarValoracion = tieneTexto(preliminarDesdeValoracion);

  const patologiaRelacionadaRaw = String(
    asistencia?.patologia_relacionada ?? "",
  ).trim();
  const zonaCanonPatologia = mapearPatologiaRelacionadaAZona(
    patologiaRelacionadaRaw,
  );
  const clasificacionPreliminarDerivadaAsistencia =
    !tienePreliminarValoracion && Boolean(zonaCanonPatologia);

  const clasificacionPreliminar = tienePreliminarValoracion
    ? preliminarDesdeValoracion
    : zonaCanonPatologia
      ? patologiaRelacionadaRaw || zonaCanonPatologia
      : "";

  const clasificacionSecundaria = normalizarTexto(
    valoracion?.clasificacion_secundaria,
  );

  const valoracionEncontrada = !!valoracion;
  const asistenciaEncontrada = !!asistencia;
  const encuestaLogrosRealizada = !!encuesta2;
  const personaNoValoradaFisioterapia =
    (valoracionEncontrada || asistenciaEncontrada) && !valoracionEncontrada;

  const hizoParteMmb2025 = valoracionEncontrada || asistenciaEncontrada;
  const esPacienteNuevo = !hizoParteMmb2025;
  const esPacienteAntiguo = hizoParteMmb2025;

  const asistencias = Math.trunc(Number(asistencia?.asistencias ?? 0));
  const totalDias = Math.trunc(Number(asistencia?.total_dias ?? 0));
  const cumpleAsistencia =
    asistenciaEncontrada && Number.isFinite(asistencias) && asistencias >= UMBRAL_ASISTENCIAS;

  const evaluacionObjetivos = evaluarObjetivosEncuesta(encuesta2);
  const objetivosCumplidos = !!evaluacionObjetivos.objetivosCumplidos;

  const tieneClasificacionPreliminar =
    tienePreliminarValoracion || clasificacionPreliminarDerivadaAsistencia;

  const etiquetaZonaOpcionesContinuidad =
    clasificacionPreliminarDerivadaAsistencia
      ? patologiaRelacionadaRaw || null
      : null;

  const tieneClasificacionSecundariaValida = esClasificacionSecundariaValida(
    clasificacionSecundaria,
  );

  const clasificacionFinal = tieneClasificacionSecundariaValida
    ? clasificacionSecundaria
    : tieneClasificacionPreliminar
      ? clasificacionPreliminar
      : null;

  let flujo = "NUEVO_PROCESO";
  let estadoPreclasificacion = "Paciente nuevo";
  let mensajePreclasificacion =
    "Paciente sin registro previo en la cohorte 2025. Debe iniciar proceso mediante anamnesis global.";
  let tipoAnamnesis = "Anamnesis global";
  let ruta = "ruta_global";

  let ocultarDeteccionDolor = false;
  let mostrarOpcionZonaSecundaria = false;
  let mostrarOpcionPreliminarFuncional = false;

  let zonaDestino = null;
  let zonaPrincipal = tieneClasificacionPreliminar
    ? clasificacionPreliminar
    : null;
  let zonaSecundaria = tieneClasificacionSecundariaValida
    ? clasificacionSecundaria
    : null;

  let destinoSugerido = "anamnesis_global";
  let mensajeFlujoGlobal = "";

  if (esPacienteAntiguo) {
    if (
      tieneClasificacionPreliminar &&
      (!cumpleAsistencia || !objetivosCumplidos)
    ) {
      flujo = "ANTIGUO_REINICIA_ZONA";
      estadoPreclasificacion = "Activa";
      mensajePreclasificacion = clasificacionPreliminarDerivadaAsistencia
        ? `No hay registro en valoración fisioterapia 2025 (persona no valorada en esa tabla). La continuidad se orienta con la patología relacionada registrada en asistencia (${patologiaRelacionadaRaw}). Tras la anamnesis global podrás ir directo a fotos de esa zona o elegir otra zona con anamnesis específica.`
        : `Usuario preclasificado para continuar en la fase correspondiente a ${clasificacionPreliminar}.`;
      ocultarDeteccionDolor = true;
      zonaDestino = clasificacionPreliminar;
      destinoSugerido = "anamnesis_zona";
      mensajeFlujoGlobal = clasificacionPreliminarDerivadaAsistencia
        ? "Paciente con registro de asistencia en 2025 pero sin fila en valoración fisioterapia. La zona sugerida proviene del campo patología relacionada en asistencia; puedes ir a fotos de esa zona sin anamnesis de zona previa."
        : "El paciente presenta un proceso previo no culminado y debe continuar la intervención correspondiente a su zona preliminar.";
    } else if (
      tieneClasificacionPreliminar &&
      cumpleAsistencia &&
      objetivosCumplidos &&
      tieneClasificacionSecundariaValida
    ) {
      flujo = "ANTIGUO_ELIGE_PRELIMINAR_O_SECUNDARIA";
      estadoPreclasificacion = "Activa";
      mensajePreclasificacion = clasificacionPreliminarDerivadaAsistencia
        ? `Preclasificación apoyada en patología relacionada en asistencia (${patologiaRelacionadaRaw}), sin registro en valoración fisioterapia. Opción de continuidad en esa zona o segundo diagnóstico en ${clasificacionSecundaria}.`
        : `Usuario preclasificado con opción de continuidad en ${clasificacionPreliminar} o activación de segundo diagnóstico en ${clasificacionSecundaria}.`;
      ocultarDeteccionDolor = true;
      mostrarOpcionZonaSecundaria = true;
      zonaDestino = clasificacionPreliminar;
      destinoSugerido = "decision_preliminar_o_secundaria";
      mensajeFlujoGlobal =
        "El paciente cumple criterios para progresión terapéutica y puede definir continuidad en su zona preliminar o activar la fase correspondiente a su segundo diagnóstico.";
    } else if (
      tieneClasificacionPreliminar &&
      cumpleAsistencia &&
      objetivosCumplidos &&
      !tieneClasificacionSecundariaValida
    ) {
      flujo = "ANTIGUO_FUNCIONAL_O_CAMBIO";
      estadoPreclasificacion = "Activa";
      mensajePreclasificacion =
        "Usuario preclasificado para progresión a fase funcional. También puede permanecer en su zona actual o solicitar cambio a otra zona.";
      ocultarDeteccionDolor = true;

      mostrarOpcionPreliminarFuncional = false;

      zonaDestino = clasificacionPreliminar;
      destinoSugerido = "decision_funcional_o_cambio";
      mensajeFlujoGlobal = `El paciente cumple el mínimo de asistencias (≥ ${UMBRAL_ASISTENCIAS}), cumplió objetivos, no presenta segundo diagnóstico y puede avanzar a funcional. Si lo requiere, también puede permanecer en su zona actual o cambiar a otra zona diagnóstica.`;
    } else {
      flujo = "ANTIGUO_SIN_CLASIFICACION_TOMA_FLUJO_NUEVO";
      estadoPreclasificacion = "Sin clasificación previa";
      mensajePreclasificacion =
        "Paciente con antecedente en la cohorte 2025, pero sin clasificación preliminar ni secundaria válida. Debe continuar con flujo de paciente nuevo: anamnesis global, selección de zona y fotos.";
      ocultarDeteccionDolor = false;
      destinoSugerido = "anamnesis_global";
      mensajeFlujoGlobal =
        "Aunque el paciente presenta antecedente previo, no cuenta con clasificación preliminar ni secundaria válida. Por tanto, debe seguir flujo completo: anamnesis global, anamnesis de zona y registro de fotos.";

      zonaDestino = null;
    }
  }

  const preclasifica = estadoPreclasificacion === "Activa";

  return {
    documentoConsultaNormalizado: documentoNormalizado,

    hizoParteMmb2025,
    esPacienteNuevo,
    esPacienteAntiguo,

    valoracionEncontrada,
    asistenciaEncontrada,
    encuestaLogrosRealizada,

    encuestaLogrosEstado: evaluacionObjetivos.encuestaLogrosEstado,
    objetivosCumplidos,
    cantidadObjetivos: evaluacionObjetivos.cantidadObjetivos,
    cantidadObjetivosCumplidos: evaluacionObjetivos.cantidadObjetivosCumplidos,

    asistencias,
    totalDias,
    umbralAsistencias: UMBRAL_ASISTENCIAS,
    cumpleAsistencia,

    clasificacionPreliminarDesdeBd: preliminarCruda || null,
    clasificacionSecundariaDesdeBd: secundariaCruda || null,
    patologiaRelacionadaDesdeAsistencia: patologiaRelacionadaRaw || null,
    zonasPatologiaRelacionadaCanon:
      extraerZonasCanonDesdePatologiaRelacionada(patologiaRelacionadaRaw),
    personaNoValoradaFisioterapia,
    clasificacionPreliminarDerivadaAsistencia,
    zonaCanonDesdePatologiaAsistencia: zonaCanonPatologia,
    etiquetaZonaOpcionesContinuidad,

    clasificacionPreliminar: tieneClasificacionPreliminar
      ? clasificacionPreliminar
      : null,
    clasificacionSecundaria: tieneClasificacionSecundariaValida
      ? clasificacionSecundaria
      : null,
    tieneClasificacionSecundariaValida,
    clasificacionFinal,

    flujo,
    estadoPreclasificacion,
    mensajePreclasificacion,

    ocultarDeteccionDolor,
    mostrarOpcionZonaSecundaria,
    mostrarOpcionPreliminarFuncional,

    zonaPrincipal,
    zonaSecundaria,
    zonaDestino,
    destinoSugerido,
    mensajeFlujoGlobal,

    preclasifica,
    tipoAnamnesis,
    ruta,
  };
}
