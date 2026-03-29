/** Borrador persistente (localStorage): sobrevive a F5 y cierre de pestaña hasta guardar en BD o limpiar. */
const STORAGE_KEY_V2 = "wk_anamnesis_global_draft_v2";
/** Formato anterior (sessionStorage): migración puntual al leer. */
const LEGACY_SESSION_KEY = "wk_anamnesis_global_draft";

export function normalizarDocPaciente(paciente) {
  return String(
    paciente?.numero_documento_fisico ||
      paciente?.num_documento ||
      paciente?.cedula ||
      "",
  )
    .replace(/\D/g, "")
    .trim();
}

function normalizarDoc(doc) {
  return String(doc || "")
    .replace(/\D/g, "")
    .trim();
}

/**
 * @param {string} docPaciente — solo dígitos o texto; se normaliza
 * @returns {{ form: object, resultado: object | null } | null}
 */
export function obtenerAnamnesisGlobalBorrador(docPaciente) {
  const doc = normalizarDoc(docPaciente);
  if (!doc) return null;

  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY_V2);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (normalizarDoc(parsed?.doc) === doc && parsed?.form) {
        return {
          form: parsed.form,
          resultado: parsed.resultado ?? null,
        };
      }
    }

    const legacyRaw = sessionStorage.getItem(LEGACY_SESSION_KEY);
    if (legacyRaw) {
      const form = JSON.parse(legacyRaw);
      if (form && typeof form === "object") {
        sessionStorage.removeItem(LEGACY_SESSION_KEY);
        return { form, resultado: null };
      }
    }
  } catch (error) {
    console.error("No se pudo leer el borrador de anamnesis global", error);
  }

  return null;
}

export function guardarAnamnesisGlobalBorrador(docPaciente, formData, resultado) {
  const doc = normalizarDoc(docPaciente);
  if (!doc) return;

  try {
    localStorage.setItem(
      STORAGE_KEY_V2,
      JSON.stringify({
        doc,
        form: formData,
        resultado: resultado ?? null,
      }),
    );
  } catch (error) {
    console.error("No se pudo guardar el borrador de anamnesis global", error);
  }
}

/** Quita el borrador (tras guardar en BD o “Limpiar anamnesis”). */
export function limpiarAnamnesisGlobalBorrador() {
  try {
    localStorage.removeItem(STORAGE_KEY_V2);
    sessionStorage.removeItem(LEGACY_SESSION_KEY);
  } catch (error) {
    console.error("No se pudo limpiar el borrador de anamnesis global", error);
  }
}
