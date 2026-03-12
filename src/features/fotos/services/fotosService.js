import { supabase } from "../../../shared/lib/supabaseClient";

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
  const extension = "jpg";
  const fileName = `${crypto.randomUUID()}.${extension}`;

  const storagePath = `${user.id}/${pacienteSafe}/${sesionSafe}/${tipoSafe}/${fileName}`;

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
