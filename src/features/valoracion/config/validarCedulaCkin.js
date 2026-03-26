import { supabase } from "../../../shared/lib/supabaseClient";

function textoSeguro(valor) {
  return String(valor ?? "");
}

// 🔹 Normaliza dejando solo números (clave para comparar contra BD sucia)
export function normalizarDocumentoCkin(valor) {
  return textoSeguro(valor).replace(/\D/g, "").trim();
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
