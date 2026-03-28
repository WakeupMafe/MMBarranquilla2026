import { supabase } from "../../../shared/lib/supabaseClient";
import {
  esClasificacionSecundariaValida,
  evaluarObjetivosEncuesta,
} from "./valoracionRules";

function normalizarTexto(valor) {
  return String(valor || "").trim();
}

function tieneTexto(valor) {
  return normalizarTexto(valor).length > 0;
}

export async function buscarClasificacionPaciente(numeroDocumento) {
  if (!numeroDocumento) {
    throw new Error("El número de documento es obligatorio");
  }

  const documento = String(numeroDocumento).trim();

  const { data: valoracionRows, error: errorValoracion } = await supabase
    .from("valoraciones_fisioterapia")
    .select("num_documento, clasificacion_preliminar, clasificacion_secundaria")
    .eq("num_documento", documento)
    .limit(1);

  if (errorValoracion) {
    throw new Error(
      errorValoracion.message || "No se pudo consultar la valoración física",
    );
  }

  const valoracion = valoracionRows?.[0] || null;

  const { data: encuestaRows, error: errorEncuesta2 } = await supabase
    .from("encuesta2")
    .select(
      "cedula, obj1_original, obj1_nuevo, obj2_original, obj2_nuevo, obj3_original, obj3_nuevo",
    )
    .eq("cedula", documento)
    .limit(1);

  if (errorEncuesta2) {
    throw new Error(
      errorEncuesta2.message || "No se pudo consultar la encuesta de logros",
    );
  }

  const encuesta2 = encuestaRows?.[0] || null;

  const { data: asistenciaRows, error: errorAsistencia } = await supabase
    .from("asistencia")
    .select("porcentaje_asistencia")
    .eq("numero_documento", documento)
    .limit(1);

  if (errorAsistencia) {
    throw new Error(
      errorAsistencia.message ||
        "No se pudo consultar la asistencia del paciente",
    );
  }

  const asistencia = asistenciaRows?.[0] || null;

  const clasificacionPreliminar = normalizarTexto(
    valoracion?.clasificacion_preliminar,
  );
  const clasificacionSecundaria = normalizarTexto(
    valoracion?.clasificacion_secundaria,
  );

  const valoracionEncontrada = !!valoracion;
  const asistenciaEncontrada = !!asistencia;
  const encuestaLogrosRealizada = !!encuesta2;

  const hizoParteMmb2025 = valoracionEncontrada || asistenciaEncontrada;
  const esPacienteNuevo = !hizoParteMmb2025;
  const esPacienteAntiguo = hizoParteMmb2025;

  const porcentajeAsistencia = Number(asistencia?.porcentaje_asistencia ?? 0);
  const cumpleAsistencia = porcentajeAsistencia >= 65;

  const evaluacionObjetivos = evaluarObjetivosEncuesta(encuesta2);
  const objetivosCumplidos = !!evaluacionObjetivos.objetivosCumplidos;

  const tieneClasificacionPreliminar = tieneTexto(clasificacionPreliminar);

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
  let preclasifica = false;

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
    // CASO 1:
    // No cumple asistencia o no cumple objetivos -> vuelve a su zona preliminar
    if (
      tieneClasificacionPreliminar &&
      (!cumpleAsistencia || !objetivosCumplidos)
    ) {
      flujo = "ANTIGUO_REINICIA_ZONA";
      estadoPreclasificacion = "Activa";
      mensajePreclasificacion = `Usuario preclasificado para continuar en la fase correspondiente a ${clasificacionPreliminar}.`;
      ocultarDeteccionDolor = true;
      zonaDestino = clasificacionPreliminar;
      destinoSugerido = "anamnesis_zona";
      mensajeFlujoGlobal =
        "El paciente presenta un proceso previo no culminado y debe continuar la intervención correspondiente a su zona preliminar.";
    }

    // CASO 2:
    // Cumple todo y sí tiene secundaria -> elegir entre preliminar o segundo diagnóstico
    else if (
      tieneClasificacionPreliminar &&
      cumpleAsistencia &&
      objetivosCumplidos &&
      tieneClasificacionSecundariaValida
    ) {
      flujo = "ANTIGUO_ELIGE_PRELIMINAR_O_SECUNDARIA";
      estadoPreclasificacion = "Activa";
      mensajePreclasificacion = `Usuario preclasificado con opción de continuidad en ${clasificacionPreliminar} o activación de segundo diagnóstico en ${clasificacionSecundaria}.`;
      ocultarDeteccionDolor = true;
      mostrarOpcionZonaSecundaria = true;
      zonaDestino = clasificacionPreliminar;
      destinoSugerido = "decision_preliminar_o_secundaria";
      mensajeFlujoGlobal =
        "El paciente cumple criterios para progresión terapéutica y puede definir continuidad en su zona preliminar o activar la fase correspondiente a su segundo diagnóstico.";
    }

    // CASO 3:
    // Cumple todo y no tiene secundaria -> elegir entre preliminar o funcional
    // CASO 3:
    // Cumple todo y no tiene secundaria -> sugerir funcional,
    // pero permitir quedarse en su zona actual o cambiar a otra zona
    else if (
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

      // 🔵 ya no usaremos el flujo viejo de preliminar o funcional
      mostrarOpcionPreliminarFuncional = false;

      zonaDestino = clasificacionPreliminar;
      destinoSugerido = "decision_funcional_o_cambio";
      mensajeFlujoGlobal =
        "El paciente cumplió asistencia y objetivos, no presenta segundo diagnóstico y puede avanzar a funcional. Si lo requiere, también puede permanecer en su zona actual o cambiar a otra zona diagnóstica.";
    }
    // Antiguo sin clasificación preliminar clara
    else {
      flujo = "ANTIGUO_SIN_CLASIFICACION_TOMA_FLUJO_NUEVO";
      estadoPreclasificacion = "Sin clasificación previa";
      mensajePreclasificacion =
        "Paciente con antecedente en la cohorte 2025, pero sin clasificación preliminar ni secundaria válida. Debe continuar con flujo de paciente nuevo: anamnesis global, selección de zona y fotos.";
      ocultarDeteccionDolor = false;
      destinoSugerido = "anamnesis_global";
      mensajeFlujoGlobal =
        "Aunque el paciente presenta antecedente previo, no cuenta con clasificación preliminar ni secundaria válida. Por tanto, debe seguir flujo completo: anamnesis global, anamnesis de zona y registro de fotos.";

      // 🔹 importante: no hereda zona previa
      zonaDestino = null;
    }
  }

  return {
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

    porcentajeAsistencia,
    cumpleAsistencia,

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
