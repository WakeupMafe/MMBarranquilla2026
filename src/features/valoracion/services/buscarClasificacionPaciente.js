import { supabase } from "../../../shared/lib/supabaseClient";
import {
  esClasificacionSecundariaValida,
  evaluarObjetivosEncuesta,
} from "./valoracionRules";

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

  const hizoParteMmb2025 = !!valoracion;
  const porcentajeAsistencia = Number(asistencia?.porcentaje_asistencia ?? 0);
  const cumpleAsistencia = porcentajeAsistencia >= 65;
  const encuestaLogrosRealizada = !!encuesta2;

  const evaluacionObjetivos = evaluarObjetivosEncuesta(encuesta2);

  const tieneClasificacionSecundariaValida = esClasificacionSecundariaValida(
    valoracion?.clasificacion_secundaria,
  );

  const clasificacionFinal = tieneClasificacionSecundariaValida
    ? valoracion?.clasificacion_secundaria
    : valoracion?.clasificacion_preliminar || null;

  const clasificacionZonaDetectada = tieneClasificacionSecundariaValida
    ? valoracion?.clasificacion_secundaria
    : null;

  const cumpleRequisitosMinimos =
    hizoParteMmb2025 &&
    evaluacionObjetivos.objetivosCumplidos &&
    cumpleAsistencia;

  const preclasifica =
    cumpleRequisitosMinimos && tieneClasificacionSecundariaValida;

  let estadoPreclasificacion = "No cumple requisitos";
  let mensajePreclasificacion =
    "Este paciente no cumple los requisitos de preclasificación.";

  if (preclasifica) {
    estadoPreclasificacion = "Activa";
    mensajePreclasificacion =
      "Este paciente cumple los requisitos de preclasificación.";
  } else if (cumpleRequisitosMinimos && !tieneClasificacionSecundariaValida) {
    estadoPreclasificacion = "Se sugiere nuevo análisis";
    mensajePreclasificacion =
      "El usuario tuvo un excelente desempeño y puede iniciar una nueva fase mediante anamnesis global.";
  }

  const soloAnamnesisPorZona = preclasifica;

  const tipoAnamnesis = preclasifica
    ? "Anamnesis por zona"
    : "Anamnesis global";

  const ruta = preclasifica ? "ruta_abreviada" : "ruta_completa";

  return {
    hizoParteMmb2025,
    valoracionEncontrada: !!valoracion,

    encuestaLogrosRealizada,
    encuestaLogrosEstado: evaluacionObjetivos.encuestaLogrosEstado,
    objetivosCumplidos: evaluacionObjetivos.objetivosCumplidos,
    cantidadObjetivos: evaluacionObjetivos.cantidadObjetivos,
    cantidadObjetivosCumplidos: evaluacionObjetivos.cantidadObjetivosCumplidos,

    asistenciaEncontrada: !!asistencia,
    porcentajeAsistencia,
    cumpleAsistencia,

    clasificacionPreliminar: valoracion?.clasificacion_preliminar || null,
    clasificacionSecundaria: valoracion?.clasificacion_secundaria || null,
    tieneClasificacionSecundariaValida,
    clasificacionFinal,
    clasificacionZonaDetectada,

    cumpleRequisitosMinimos,
    preclasifica,
    estadoPreclasificacion,
    mensajePreclasificacion,

    soloAnamnesisPorZona,
    tipoAnamnesis,
    ruta,
  };
}
