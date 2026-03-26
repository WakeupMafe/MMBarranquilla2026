const CADERA_UPLOAD_MODE_KEY = "cadera_upload_mode";

export const CADERA_UPLOAD_MODES = {
  SIMULACION: "SIMULACION",
  REAL: "REAL",
};

export function getCaderaUploadMode() {
  const savedMode = localStorage.getItem(CADERA_UPLOAD_MODE_KEY);

  if (
    savedMode === CADERA_UPLOAD_MODES.SIMULACION ||
    savedMode === CADERA_UPLOAD_MODES.REAL
  ) {
    return savedMode;
  }

  return CADERA_UPLOAD_MODES.SIMULACION;
}

export function setCaderaUploadMode(mode) {
  if (
    mode !== CADERA_UPLOAD_MODES.SIMULACION &&
    mode !== CADERA_UPLOAD_MODES.REAL
  ) {
    throw new Error("Modo de carga de cadera no válido.");
  }

  localStorage.setItem(CADERA_UPLOAD_MODE_KEY, mode);
}
