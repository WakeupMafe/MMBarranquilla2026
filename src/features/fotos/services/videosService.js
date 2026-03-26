import { supabase } from "../../../shared/lib/supabaseClient";
import { isFotosUploadSimulacionMode } from "../../../shared/lib/fotosUploadMode";

const BUCKET_NAME = "videos_pacientes";

function sanitizeSegment(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");
}

function getExtensionFromFile(file) {
  const originalName = String(file?.name || "");
  const byName = originalName.includes(".")
    ? originalName.split(".").pop()?.toLowerCase()
    : "";

  if (byName) return byName;

  const mime = String(file?.type || "").toLowerCase();

  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("webm")) return "webm";
  if (mime.includes("ogg")) return "ogv";
  if (mime.includes("quicktime")) return "mov";

  return "mp4";
}

function getSafeContentType(file) {
  const mime = String(file?.type || "").toLowerCase();

  if (mime.startsWith("video/")) {
    return mime;
  }

  return "video/mp4";
}

export async function uploadVideoPaciente({
  file,
  pacienteDocumento,
  tipoVideo,
  sesionTipo,
  profesionalCedula,
  zonasEvaluadas = [],
  observacion = "",
  duracionSegundos = null,
}) {
  if (!file) {
    throw new Error("No hay archivo de video para subir.");
  }

  if (!pacienteDocumento) {
    throw new Error("Falta el documento del paciente.");
  }

  if (!tipoVideo) {
    throw new Error("Falta el tipo de video.");
  }

  if (!profesionalCedula) {
    throw new Error("Falta la cédula del profesional.");
  }

  if (!String(file.type || "").startsWith("video/")) {
    throw new Error("El archivo recibido no es un video válido.");
  }

  const zonasNormalizadas = Array.isArray(zonasEvaluadas)
    ? zonasEvaluadas.filter(Boolean).map((z) => String(z).trim())
    : [];

  const extension = getExtensionFromFile(file);
  const contentType = getSafeContentType(file);
  const fileName = `${crypto.randomUUID()}.${extension}`;

  // simulación
  if (isFotosUploadSimulacionMode()) {
    const payloadSimulado = {
      paciente_documento: String(pacienteDocumento),
      tipo_video: String(tipoVideo),
      zonas_evaluadas: zonasNormalizadas,
      nombre_archivo: fileName,
      storage_path: `simulacion/${String(pacienteDocumento)}/${String(tipoVideo)}/${fileName}`,
      profesional_cedula: String(profesionalCedula),
      sesion_tipo: sesionTipo ? String(sesionTipo) : null,
      observacion: observacion ? String(observacion) : null,
      duracion_segundos:
        duracionSegundos !== null && duracionSegundos !== undefined
          ? Number(duracionSegundos)
          : null,
      content_type: contentType,
      tamano_bytes: Number(file.size || 0),
    };

    console.log("SIMULACIÓN VIDEO", payloadSimulado);

    return {
      ...payloadSimulado,
      id: crypto.randomUUID(),
      public_url: null,
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("No hay sesión activa para subir videos.");
  }

  const pacienteSafe = sanitizeSegment(pacienteDocumento);
  const tipoSafe = sanitizeSegment(tipoVideo);
  const sesionSafe = sanitizeSegment(sesionTipo || "general");
  const zonasSafe = sanitizeSegment(
    zonasNormalizadas.length ? zonasNormalizadas.join("_") : "general",
  );

  const storagePath = `${user.id}/${pacienteSafe}/${sesionSafe}/${zonasSafe}/${tipoSafe}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType,
    });

  if (uploadError) {
    throw new Error(`Error subiendo el video: ${uploadError.message}`);
  }

  const payload = {
    paciente_documento: String(pacienteDocumento),
    tipo_video: String(tipoVideo),
    zonas_evaluadas: zonasNormalizadas,
    nombre_archivo: fileName,
    storage_path: storagePath,
    profesional_cedula: String(profesionalCedula),
    sesion_tipo: sesionTipo ? String(sesionTipo) : null,
    observacion: observacion ? String(observacion) : null,
    duracion_segundos:
      duracionSegundos !== null && duracionSegundos !== undefined
        ? Number(duracionSegundos)
        : null,
    content_type: contentType,
    tamano_bytes: Number(file.size || 0),
  };

  const { data, error: insertError } = await supabase
    .from("videos_pacientes")
    .insert(payload)
    .select()
    .single();

  if (insertError) {
    await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    throw new Error(
      `Error guardando el registro del video: ${insertError.message}`,
    );
  }

  return data;
}
