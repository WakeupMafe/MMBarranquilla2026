const ANAMNESIS_GLOBAL_DRAFT_KEY = "wk_anamnesis_global_draft";

export function guardarAnamnesisGlobalDraft(data) {
  try {
    sessionStorage.setItem(ANAMNESIS_GLOBAL_DRAFT_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("No se pudo guardar el draft de anamnesis global", error);
  }
}

export function obtenerAnamnesisGlobalDraft() {
  try {
    const raw = sessionStorage.getItem(ANAMNESIS_GLOBAL_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("No se pudo leer el draft de anamnesis global", error);
    return null;
  }
}

export function limpiarAnamnesisGlobalDraft() {
  try {
    sessionStorage.removeItem(ANAMNESIS_GLOBAL_DRAFT_KEY);
  } catch (error) {
    console.error("No se pudo limpiar el draft de anamnesis global", error);
  }
}
