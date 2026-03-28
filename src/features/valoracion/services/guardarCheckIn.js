import { supabase } from "../../../shared/lib/supabaseClient";
import { normalizarDocumentoCkin } from "../config/validarCedulaCkin";

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
  const docCanon = normalizarDocumentoCkin(
    String(paciente?.numero_documento_fisico ?? cedula ?? ""),
  );

  const instructorNombre = textoSeguro(instructor);
  const lugar = textoSeguro(lugarValoracion);
  const seguridad = textoSeguro(seguridadSocial);

  if (!docCanon) {
    throw new Error("La cédula del paciente es obligatoria.");
  }

  // FK hacia participantes(numero_documento_fisico): debe coincidir exactamente con el valor en BD
  // (p. ej. si hay caracteres invisibles en la tabla, hay que reenviar el mismo texto).
  const numeroDocumentoFisico =
    paciente?.numero_documento_fisico != null &&
    String(paciente.numero_documento_fisico).trim() !== ""
      ? String(paciente.numero_documento_fisico)
      : docCanon;

  if (!instructorNombre) {
    throw new Error("El nombre del instructor es obligatorio.");
  }

  if (!lugar) {
    throw new Error("El lugar de valoración es obligatorio.");
  }

  if (!seguridad) {
    throw new Error("La seguridad social es obligatoria.");
  }

  // 🔍 VALIDAR SI YA EXISTE (misma lógica que validarCheckInExistente: documento solo dígitos)
  const { data: existente, error: errorBusqueda } = await supabase
    .from("checkin_anamnesis")
    .select("numero_documento_fisico")
    .eq("numero_documento_fisico", docCanon)
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
    numero_documento_fisico: numeroDocumentoFisico,
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
