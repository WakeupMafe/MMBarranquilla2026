import { supabase } from "../../../shared/lib/supabaseClient";

function textoSeguro(valor) {
  return String(valor ?? "").trim();
}

export async function guardarCheckIn({
  cedula,
  instructor,
  lugarValoracion,
  habeasData,
  autorizacionImagen,
  seguridadSocial,
  paciente,
}) {
  // 🔴 IMPORTANTE:
  // usar el documento EXACTO que viene del paciente encontrado en participantes
  // para no romper la FK con participantes
  const numeroDocumento = String(
    paciente?.numero_documento_fisico || cedula || "",
  );

  const numeroDocumentoLimpio = textoSeguro(numeroDocumento);
  const instructorNombre = textoSeguro(instructor);
  const lugar = textoSeguro(lugarValoracion);
  const seguridad = textoSeguro(seguridadSocial);

  if (!numeroDocumentoLimpio) {
    throw new Error("La cédula del paciente es obligatoria.");
  }

  if (!instructorNombre) {
    throw new Error("El nombre del instructor es obligatorio.");
  }

  if (!lugar) {
    throw new Error("El lugar de valoración es obligatorio.");
  }

  if (!seguridad) {
    throw new Error("La seguridad social es obligatoria.");
  }

  // 🔍 VALIDAR SI YA EXISTE
  const { data: existente, error: errorBusqueda } = await supabase
    .from("checkin_anamnesis")
    .select("numero_documento_fisico")
    .eq("numero_documento_fisico", numeroDocumentoLimpio)
    .maybeSingle();

  if (errorBusqueda) {
    throw errorBusqueda;
  }

  // ⚠️ SI YA EXISTE → NO GUARDAR PERO PERMITIR CONTINUAR
  if (existente) {
    return {
      yaExiste: true,
      mensaje:
        "El usuario ya tiene check-in registrado. No se enviará a base de datos, pero puedes continuar.",
    };
  }

  // 🧠 GUARDAR
  const payload = {
    numero_documento_fisico: numeroDocumentoLimpio,
    instructor_nombre: instructorNombre,
    lugar_valoracion: lugar,
    habeas_data: Boolean(habeasData),
    autorizacion_imagen: Boolean(autorizacionImagen),
    seguridad_social: seguridad,
    paciente_nombre:
      textoSeguro(
        paciente?.nombre_apellido_documento || paciente?.nombres_apellidos,
      ) || null,
  };

  const { data, error } = await supabase
    .from("checkin_anamnesis")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    yaExiste: false,
    data,
  };
}
