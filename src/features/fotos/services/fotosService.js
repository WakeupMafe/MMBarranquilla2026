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

  const zonasNormalizadas = Array.isArray(zonasEvaluadas)
    ? zonasEvaluadas.filter(Boolean).map((z) => String(z).trim())
    : [];

  // 🔥 En simulación no sube ni guarda nada real
  if (isFotosUploadSimulacionMode()) {
    const fileName = `${crypto.randomUUID()}.jpg`;

    const payloadSimulado = {
      paciente_documento: String(pacienteDocumento),
      tipo_foto: String(tipoFoto),
      zonas_evaluadas: zonasNormalizadas,
      nombre_archivo: fileName,
      storage_path: `simulacion/${String(pacienteDocumento)}/${String(tipoFoto)}/${fileName}`,
      profesional_cedula: String(profesionalCedula),
      sesion_tipo: sesionTipo ? String(sesionTipo) : null,
      observacion: observacion ? String(observacion) : null,
    };

    console.log("SIMULACIÓN FOTO", payloadSimulado);

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
    throw new Error("No hay sesión activa para subir fotos.");
  }

  const pacienteSafe = sanitizeSegment(pacienteDocumento);
  const tipoSafe = sanitizeSegment(tipoFoto);
  const sesionSafe = sanitizeSegment(sesionTipo || "general");
  const zonasSafe = sanitizeSegment(
    zonasNormalizadas.length ? zonasNormalizadas.join("_") : "general",
  );

  const extension = "jpg";
  const fileName = `${crypto.randomUUID()}.${extension}`;

  const storagePath = `${user.id}/${pacienteSafe}/${sesionSafe}/${zonasSafe}/${tipoSafe}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: "image/jpeg",
    });

  if (uploadError) {
    throw new Error(`Error subiendo la imagen: ${uploadError.message}`);
  }

  const payload = {
    paciente_documento: String(pacienteDocumento),
    tipo_foto: String(tipoFoto),
    zonas_evaluadas: zonasNormalizadas,
    nombre_archivo: fileName,
    storage_path: storagePath,
    profesional_cedula: String(profesionalCedula),
    sesion_tipo: sesionTipo ? String(sesionTipo) : null,
    observacion: observacion ? String(observacion) : null,
  };

  const { data, error: insertError } = await supabase
    .from("fotos_pacientes")
    .insert(payload)
    .select()
    .single();

  if (insertError) {
    await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    throw new Error(`Error guardando el registro: ${insertError.message}`);
  }

  return data;
}
