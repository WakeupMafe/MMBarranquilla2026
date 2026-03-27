import { supabase } from "../../../shared/lib/supabaseClient";
import { alertConfirm, alertError } from "../../../shared/lib/alerts";

function normalizarDocumento(valor) {
  return String(valor ?? "").trim();
}

export async function editarGlobalPorErrores(numeroDocumento) {
  const cedula = normalizarDocumento(numeroDocumento);

  if (!cedula) {
    await alertError(
      "Paciente no identificado",
      "No fue posible identificar la cédula del paciente para validar si ya existe una ruta previa en anamnesis global.",
    );

    return {
      puedeContinuar: false,
      existeRegistroPrevio: false,
      debeSobrescribir: false,
      registroPrevio: null,
    };
  }

  const { data, error } = await supabase
    .from("anamnesis_global")
    .select("numero_documento_fisico, siguiente_paso, mensaje_resultado")
    .eq("numero_documento_fisico", cedula)
    .maybeSingle();

  if (error) {
    console.error("Error consultando anamnesis_global existente:", error);

    await alertError(
      "Error validando ruta previa",
      "No fue posible verificar si el paciente ya tenía una ruta previa registrada en anamnesis global. Inténtalo nuevamente.",
    );

    return {
      puedeContinuar: false,
      existeRegistroPrevio: false,
      debeSobrescribir: false,
      registroPrevio: null,
    };
  }

  if (!data) {
    return {
      puedeContinuar: true,
      existeRegistroPrevio: false,
      debeSobrescribir: false,
      registroPrevio: null,
    };
  }

  const confirmar = await alertConfirm({
    title: "Ruta previa encontrada",
    text: "Este paciente ya tiene una ruta previa registrada en anamnesis global. Si continúas, se reemplazará la ruta anterior con la nueva información ingresada. ¿Deseas seguir?",
    confirmText: "Sí, seguir",
    cancelText: "Cancelar",
  });

  if (!confirmar) {
    return {
      puedeContinuar: false,
      existeRegistroPrevio: true,
      debeSobrescribir: false,
      registroPrevio: data,
    };
  }

  return {
    puedeContinuar: true,
    existeRegistroPrevio: true,
    debeSobrescribir: true,
    registroPrevio: data,
  };
}
