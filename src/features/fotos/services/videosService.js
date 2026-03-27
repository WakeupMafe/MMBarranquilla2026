import { supabase } from "../../../shared/lib/supabaseClient";
import { isFotosUploadSimulacionMode } from "../../../shared/lib/fotosUploadMode";

const BUCKET_NAME = "fotos_pacientes";

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

  if (byName && ["mp4", "webm", "ogv", "mov"].includes(byName)) {
    return byName;
  }

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

function mergeUniqueStrings(current = [], incoming = []) {
  return [
    ...new Set([...(current || []), ...(incoming || [])].filter(Boolean)),
  ];
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

  const pacienteDocumentoFinal = String(pacienteDocumento);
  const tipoVideoFinal = String(tipoVideo);
  const sesionTipoFinal = sesionTipo ? String(sesionTipo) : "general";
  const profesionalCedulaFinal = String(profesionalCedula);

  const extension = getExtensionFromFile(file);
  const contentType = getSafeContentType(file);
  const fileName = `${crypto.randomUUID()}.${extension}`;

  // 🔹 SIMULACIÓN
  if (isFotosUploadSimulacionMode()) {
    const payloadSimulado = {
      numero_documento_fisico: pacienteDocumentoFinal,
      sesion_tipo: sesionTipoFinal,
      profesional_cedula: profesionalCedulaFinal,
      zonas_evaluadas: zonasNormalizadas,
      fotos: {},
      videos: {
        [tipoVideoFinal]: {
          nombre_archivo: fileName,
          storage_path: `simulacion/${pacienteDocumentoFinal}/${sesionTipoFinal}/${tipoVideoFinal}/${fileName}`,
          public_url: null,
          mime_type: contentType,
          tamano_bytes: Number(file.size || 0),
          duracion_segundos:
            duracionSegundos !== null && duracionSegundos !== undefined
              ? Number(duracionSegundos)
              : null,
          observacion: observacion ? String(observacion) : null,
          fecha_subida: new Date().toISOString(),
          tipo_archivo: "video",
        },
      },
    };

    console.log("SIMULACIÓN VIDEO", payloadSimulado);

    return {
      success: true,
      simulacion: true,
      data: payloadSimulado,
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("No hay sesión activa para subir videos.");
  }

  const pacienteSafe = sanitizeSegment(pacienteDocumentoFinal);
  const tipoSafe = sanitizeSegment(tipoVideoFinal);
  const sesionSafe = sanitizeSegment(sesionTipoFinal);
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

  const nuevoVideo = {
    nombre_archivo: fileName,
    storage_path: storagePath,
    public_url: null,
    mime_type: contentType,
    tamano_bytes: Number(file.size || 0),
    duracion_segundos:
      duracionSegundos !== null && duracionSegundos !== undefined
        ? Number(duracionSegundos)
        : null,
    observacion: observacion ? String(observacion) : null,
    fecha_subida: new Date().toISOString(),
    tipo_archivo: "video",
  };

  const { data: existente, error: selectError } = await supabase
    .from("fotos_pacientes")
    .select(
      "numero_documento_fisico, sesion_tipo, zonas_evaluadas, fotos, videos",
    )
    .eq("numero_documento_fisico", pacienteDocumentoFinal)
    .eq("sesion_tipo", sesionTipoFinal)
    .maybeSingle();

  if (selectError) {
    await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    throw new Error(
      `Error consultando la sesión actual: ${selectError.message}`,
    );
  }

  const fotosActuales =
    existente?.fotos && typeof existente.fotos === "object"
      ? existente.fotos
      : {};

  const videosActuales =
    existente?.videos && typeof existente.videos === "object"
      ? existente.videos
      : {};

  const zonasFinales = mergeUniqueStrings(
    existente?.zonas_evaluadas || [],
    zonasNormalizadas,
  );

  const videosFinales = {
    ...videosActuales,
    [tipoVideoFinal]: nuevoVideo,
  };

  const payload = {
    numero_documento_fisico: pacienteDocumentoFinal,
    sesion_tipo: sesionTipoFinal,
    profesional_cedula: profesionalCedulaFinal,
    zonas_evaluadas: zonasFinales,
    observacion: observacion ? String(observacion) : null,
    fotos: fotosActuales,
    videos: videosFinales,
    updated_at: new Date().toISOString(),
  };

  const { data, error: upsertError } = await supabase
    .from("fotos_pacientes")
    .upsert(payload, {
      onConflict: "numero_documento_fisico,sesion_tipo",
    })
    .select()
    .single();

  if (upsertError) {
    await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    throw new Error(
      `Error guardando la sesión de evidencia: ${upsertError.message}`,
    );
  }

  return data;
}
