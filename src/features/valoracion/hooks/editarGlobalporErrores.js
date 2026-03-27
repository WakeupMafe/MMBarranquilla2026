import { supabase } from "../../../shared/lib/supabaseClient";
import { alertConfirm, alertError } from "../../../shared/lib/alerts";

function normalizarDocumento(valor) {
  return String(valor ?? "").trim();
}

function normalizarTexto(valor) {
  return String(valor ?? "")
    .trim()
    .toLowerCase();
}

function arreglarArray(valor) {
  return Array.isArray(valor)
    ? valor
        .map((item) =>
          String(item ?? "")
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean)
    : [];
}

function sonArraysIguales(a = [], b = []) {
  if (a.length !== b.length) return false;

  const aOrdenado = [...a].sort();
  const bOrdenado = [...b].sort();

  return aOrdenado.every((valor, index) => valor === bOrdenado[index]);
}

export async function editarGlobalPorErrores(numeroDocumento, resultadoNuevo) {
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
      cambioRutaDetectado: false,
      registroPrevio: null,
    };
  }

  const { data, error } = await supabase
    .from("anamnesis_global")
    .select(
      "numero_documento_fisico, siguiente_paso, mensaje_resultado, zonas_detectadas",
    )
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
      cambioRutaDetectado: false,
      registroPrevio: null,
    };
  }

  if (!data) {
    return {
      puedeContinuar: true,
      existeRegistroPrevio: false,
      debeSobrescribir: false,
      cambioRutaDetectado: false,
      registroPrevio: null,
    };
  }

  const pasoPrevio = normalizarTexto(data?.siguiente_paso);
  const pasoNuevo = normalizarTexto(resultadoNuevo?.siguientePaso);

  const zonasPrevias = arreglarArray(data?.zonas_detectadas);
  const zonasNuevas = arreglarArray(resultadoNuevo?.zonasDetectadas);

  const cambioPaso = pasoPrevio !== pasoNuevo;
  const cambioZonas = !sonArraysIguales(zonasPrevias, zonasNuevas);
  const cambioRutaDetectado = cambioPaso || cambioZonas;

  const confirmar = await alertConfirm({
    title: cambioRutaDetectado
      ? "Re-evaluación detectada"
      : "Ruta previa encontrada",
    text: cambioRutaDetectado
      ? "Se detectó un cambio en la ruta previamente registrada para este paciente. Si continúas, se reemplazará la ruta anterior con la nueva decisión clínica. ¿Deseas continuar?"
      : "Este paciente ya tiene una ruta previa registrada en anamnesis global. Si continúas, se actualizará con la información actual. ¿Deseas continuar?",
    confirmText: "Sí, continuar",
    cancelText: "Cancelar",
  });

  if (!confirmar) {
    return {
      puedeContinuar: false,
      existeRegistroPrevio: true,
      debeSobrescribir: false,
      cambioRutaDetectado,
      registroPrevio: data,
    };
  }

  return {
    puedeContinuar: true,
    existeRegistroPrevio: true,
    debeSobrescribir: true,
    cambioRutaDetectado,
    registroPrevio: data,
  };
}
