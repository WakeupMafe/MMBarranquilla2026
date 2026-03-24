export const ANAMNESIS_GLOBAL_UPLOAD_MODES = {
  SIMULACION: "SIMULACION",
  REAL: "REAL",
};

const STORAGE_KEY = "wk_anamnesis_global_upload_mode";

export function getAnamnesisGlobalUploadMode() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (
    saved === ANAMNESIS_GLOBAL_UPLOAD_MODES.REAL ||
    saved === ANAMNESIS_GLOBAL_UPLOAD_MODES.SIMULACION
  ) {
    return saved;
  }

  return ANAMNESIS_GLOBAL_UPLOAD_MODES.SIMULACION;
}

export function setAnamnesisGlobalUploadMode(mode) {
  if (
    mode !== ANAMNESIS_GLOBAL_UPLOAD_MODES.REAL &&
    mode !== ANAMNESIS_GLOBAL_UPLOAD_MODES.SIMULACION
  ) {
    throw new Error("Modo de anamnesis global inválido.");
  }

  localStorage.setItem(STORAGE_KEY, mode);
}
