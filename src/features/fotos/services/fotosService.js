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

function getSafeImageContentType(file) {
  const mime = String(file?.type || "").toLowerCase();
  return mime.startsWith("image/") ? mime : "image/jpeg";
}

function getExtensionFromFile(file) {
  const originalName = String(file?.name || "");
  const byName = originalName.includes(".")
    ? originalName.split(".").pop()?.toLowerCase()
    : "";

  if (byName && ["jpg", "jpeg", "png", "webp"].includes(byName)) {
    return byName === "jpeg" ? "jpg" : byName;
  }

  const mime = String(file?.type || "").toLowerCase();

  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";

  return "jpg";
}

function mergeUniqueStrings(current = [], incoming = []) {
  return [
    ...new Set([...(current || []), ...(incoming || [])].filter(Boolean)),
  ];
}

export async function uploadFotoPaciente({
  file,
  pacienteDocumento,
  tipoFoto,
  sesionTipo,
  profesionalCedula,
  zonasEvaluadas = [],
  observacion = "",
}) {
  if (!file) {
    throw new Error("No hay archivo para subir.");
  }

  if (!pacienteDocumento) {
    throw new Error("Falta el documento del paciente.");
  }

  if (!tipoFoto) {
    throw new Error("Falta el tipo de foto.");
  }

  if (!profesionalCedula) {
    throw new Error("Falta la cédula del profesional.");
  }

  if (!String(file.type || "").startsWith("image/")) {
    throw new Error("El archivo recibido no es una imagen válida.");
  }

  const zonasNormalizadas = Array.isArray(zonasEvaluadas)
    ? zonasEvaluadas.filter(Boolean).map((z) => String(z).trim())
    : [];

  const sesionTipoFinal = sesionTipo ? String(sesionTipo) : "general";
  const numeroDocumentoFinal = String(pacienteDocumento);
  const profesionalCedulaFinal = String(profesionalCedula);
  const tipoFotoFinal = String(tipoFoto);

  const extension = getExtensionFromFile(file);
  const contentType = getSafeImageContentType(file);
  const fileName = `${crypto.randomUUID()}.${extension}`;

  if (isFotosUploadSimulacionMode()) {
    const payloadSimulado = {
      numero_documento_fisico: numeroDocumentoFinal,
      sesion_tipo: sesionTipoFinal,
      profesional_cedula: profesionalCedulaFinal,
      zonas_evaluadas: zonasNormalizadas,
      observacion: observacion ? String(observacion) : null,
      fotos: {
        [tipoFotoFinal]: {
          nombre_archivo: fileName,
          storage_path: `simulacion/${numeroDocumentoFinal}/${sesionTipoFinal}/${tipoFotoFinal}/${fileName}`,
          public_url: null,
          mime_type: contentType,
          tamano_bytes: Number(file.size || 0),
          observacion: observacion ? String(observacion) : null,
          fecha_subida: new Date().toISOString(),
          tipo_archivo: "foto",
        },
      },
      videos: {},
      updated_at: new Date().toISOString(),
    };

    console.log("SIMULACIÓN FOTO", payloadSimulado);

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
    throw new Error("No hay sesión activa para subir fotos.");
  }

  const pacienteSafe = sanitizeSegment(numeroDocumentoFinal);
  const tipoSafe = sanitizeSegment(tipoFotoFinal);
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
    throw new Error(`Error subiendo la imagen: ${uploadError.message}`);
  }

  const nuevaFoto = {
    nombre_archivo: fileName,
    storage_path: storagePath,
    public_url: null,
    mime_type: contentType,
    tamano_bytes: Number(file.size || 0),
    observacion: observacion ? String(observacion) : null,
    fecha_subida: new Date().toISOString(),
    tipo_archivo: "foto",
  };

  const { data: existente, error: selectError } = await supabase
    .from("fotos_pacientes")
    .select(
      "numero_documento_fisico, sesion_tipo, zonas_evaluadas, observacion, fotos, videos, updated_at",
    )
    .eq("numero_documento_fisico", numeroDocumentoFinal)
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

  const fotosFinales = {
    ...fotosActuales,
    [tipoFotoFinal]: nuevaFoto,
  };

  const payload = {
    numero_documento_fisico: numeroDocumentoFinal,
    sesion_tipo: sesionTipoFinal,
    profesional_cedula: profesionalCedulaFinal,
    zonas_evaluadas: zonasFinales,
    observacion: observacion ? String(observacion) : null,
    fotos: fotosFinales,
    videos: videosActuales,
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
