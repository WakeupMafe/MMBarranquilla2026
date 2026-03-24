import { supabase } from "../../../shared/lib/supabaseClient";

export async function guardarCheckIn({
  cedula,
  instructor,
  lugarValoracion,
  habeasData,
  autorizacionImagen,
  seguridadSocial,
  paciente,
}) {
  const numeroDocumento = String(cedula || "").trim();

  if (!numeroDocumento) {
    throw new Error("La cédula del paciente es obligatoria.");
  }

  const instructorNombre = String(instructor || "").trim();
  const lugar = String(lugarValoracion || "").trim();
  const seguridad = String(seguridadSocial || "").trim();

  if (!instructorNombre) {
    throw new Error("El nombre del instructor es obligatorio.");
  }

  if (!lugar) {
    throw new Error("El lugar de valoración es obligatorio.");
  }

  if (!seguridad) {
    throw new Error("La seguridad social es obligatoria.");
  }

  const { data: existente, error: errorBusqueda } = await supabase
    .from("checkin_anamnesis")
    .select("numero_documento_fisico")
    .eq("numero_documento_fisico", numeroDocumento)
    .maybeSingle();

  if (errorBusqueda) {
    throw errorBusqueda;
  }

  if (existente) {
    throw new Error(
      "Este paciente ya tiene un check-in registrado y no se puede volver a guardar.",
    );
  }

  const payload = {
    numero_documento_fisico: numeroDocumento,
    instructor_nombre: instructorNombre,
    lugar_valoracion: lugar,
    habeas_data: Boolean(habeasData),
    autorizacion_imagen: Boolean(autorizacionImagen),
    seguridad_social: seguridad,
    paciente_nombre:
      String(
        paciente?.nombre_apellido_documento ||
          paciente?.nombres_apellidos ||
          "",
      ).trim() || null,
  };

  const { data, error } = await supabase
    .from("checkin_anamnesis")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
