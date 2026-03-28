import { supabase } from "../../../shared/lib/supabaseClient";

function textoSeguro(valor) {
  return String(valor ?? "");
}

// 🔹 Normaliza dejando solo números (clave para comparar contra BD sucia)
export function normalizarDocumentoCkin(valor) {
  if (valor == null) return "";
  // PostgREST puede devolver números si la columna es numérica; VARCHAR suele venir como string
  const base =
    typeof valor === "number" && Number.isFinite(valor)
      ? String(Math.trunc(valor))
      : textoSeguro(valor);
  return base
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // invisibles comunes
    .replace(/\s+/g, "") // espacios normales o raros
    .replace(/\D/g, "") // deja solo números
    .trim();
}

/**
 * Compara documento buscado (solo dígitos) con valor desde BD (VARCHAR u otro).
 * Trata ceros a la izquierda distintos entre app y tabla.
 */
export function mismoDocumentoBd(valorEnBd, documentoNormalizadoDigitos) {
  const busqueda = normalizarDocumentoCkin(documentoNormalizadoDigitos);
  if (!busqueda) return false;
  const enBd = normalizarDocumentoCkin(valorEnBd);
  if (!enBd) return false;
  if (enBd === busqueda) return true;
  const bd = enBd.replace(/^0+/, "") || "0";
  const doc = busqueda.replace(/^0+/, "") || "0";
  return bd === doc;
}

// 🔹 Valida que sí haya algo usable
export function validarCedulaCkin(valor) {
  const documentoNormalizado = normalizarDocumentoCkin(valor);

  return {
    esValido: Boolean(documentoNormalizado),
    documentoNormalizado,
  };
}

/**
 * 🔥 FUNCIÓN PRINCIPAL
 * Busca paciente con estrategia doble:
 *
 * 1. Búsqueda exacta (rápida)
 * 2. Búsqueda tolerante (para datos sucios en BD)
 *
 * Esto evita que tengas que limpiar la base de datos.
 */
export async function buscarPacienteCheckin(cedulaIngresada) {
  const { esValido, documentoNormalizado } = validarCedulaCkin(cedulaIngresada);

  if (!esValido) {
    console.warn("[CKIN] Cédula inválida para búsqueda.", {
      cedulaIngresada,
      documentoNormalizado,
    });

    return {
      pacienteEncontrado: null,
      documentoNormalizado,
      error: null,
    };
  }

  console.group("[CKIN] Búsqueda de paciente");
  console.log("Cédula digitada:", cedulaIngresada);
  console.log("Cédula normalizada:", documentoNormalizado);

  // =========================================================
  // 🔹 1) BÚSQUEDA EXACTA
  // =========================================================
  const { data: exacta, error: errorExacta } = await supabase
    .from("participantes")
    .select(
      "numero_documento_fisico, nombre_apellido_documento, numero_telefono, genero, fecha_nacimiento",
    )
    .eq("numero_documento_fisico", documentoNormalizado)
    .maybeSingle();

  if (errorExacta) {
    console.error("[CKIN] Error búsqueda exacta:", errorExacta);
    console.groupEnd();

    return {
      pacienteEncontrado: null,
      documentoNormalizado,
      error: errorExacta,
    };
  }

  if (exacta) {
    console.log("✅ Encontrado por búsqueda exacta");
    console.groupEnd();

    return {
      pacienteEncontrado: exacta,
      documentoNormalizado,
      error: null,
    };
  }

  // =========================================================
  // 🔹 2) BÚSQUEDA TOLERANTE (para datos sucios)
  // =========================================================
  console.warn("⚠️ No encontrado exacto, intentando búsqueda tolerante...");

  const { data: candidatos, error: errorTolerante } = await supabase
    .from("participantes")
    .select(
      "numero_documento_fisico, nombre_apellido_documento, numero_telefono, genero, fecha_nacimiento",
    )
    .ilike("numero_documento_fisico", `%${documentoNormalizado}%`)
    .limit(50);

  if (errorTolerante) {
    console.error("[CKIN] Error búsqueda tolerante:", errorTolerante);
    console.groupEnd();

    return {
      pacienteEncontrado: null,
      documentoNormalizado,
      error: errorTolerante,
    };
  }

  // 🔹 Comparación limpia vs limpia
  const pacienteEncontrado =
    (candidatos || []).find((item) => {
      const docBdNormalizado = normalizarDocumentoCkin(
        item?.numero_documento_fisico,
      );

      return docBdNormalizado === documentoNormalizado;
    }) || null;

  if (!pacienteEncontrado) {
    console.error("❌ No encontrado ni con búsqueda tolerante");

    console.log(
      "Candidatos revisados:",
      (candidatos || []).map((item) => ({
        original: item.numero_documento_fisico,
        normalizado: normalizarDocumentoCkin(item.numero_documento_fisico),
      })),
    );

    console.groupEnd();

    return {
      pacienteEncontrado: null,
      documentoNormalizado,
      error: null,
    };
  }

  console.log("✅ Encontrado con búsqueda tolerante:", {
    documentoBuscado: documentoNormalizado,
    documentoBD: pacienteEncontrado.numero_documento_fisico,
    documentoBDNormalizado: normalizarDocumentoCkin(
      pacienteEncontrado.numero_documento_fisico,
    ),
  });

  console.groupEnd();

  return {
    pacienteEncontrado,
    documentoNormalizado,
    error: null,
  };
}

/**
 * 🔴 Revisa si el paciente ya tiene un check-in registrado
 * en la tabla checkin_anamnesis.
 *
 * Usa la cédula normalizada para consultar por numero_documento_fisico.
 */
export async function validarCheckInExistente(cedulaIngresada) {
  const { esValido, documentoNormalizado } = validarCedulaCkin(cedulaIngresada);

  if (!esValido) {
    console.warn("[CKIN] Cédula inválida para validar check-in existente.", {
      cedulaIngresada,
      documentoNormalizado,
    });

    return {
      yaExiste: false,
      documentoNormalizado,
      checkinExistente: null,
      error: null,
    };
  }

  const { data, error } = await supabase
    .from("checkin_anamnesis")
    .select("numero_documento_fisico, instructor_nombre, lugar_valoracion")
    .eq("numero_documento_fisico", documentoNormalizado)
    .maybeSingle();

  if (error) {
    console.error("[CKIN] Error validando check-in existente:", error);

    return {
      yaExiste: false,
      documentoNormalizado,
      checkinExistente: null,
      error,
    };
  }

  if (data) {
    console.warn("[CKIN] El paciente ya realizó check-in:", data);

    return {
      yaExiste: true,
      documentoNormalizado,
      checkinExistente: data,
      error: null,
    };
  }

  return {
    yaExiste: false,
    documentoNormalizado,
    checkinExistente: null,
    error: null,
  };
}
