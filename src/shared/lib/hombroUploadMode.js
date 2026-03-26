const HOMBRO_UPLOAD_MODE_KEY = "hombro_upload_mode";

export const HOMBRO_UPLOAD_MODES = {
  SIMULACION: "SIMULACION",
  REAL: "REAL",
};

export function getHombroUploadMode() {
  const savedMode = localStorage.getItem(HOMBRO_UPLOAD_MODE_KEY);

  if (
    savedMode === HOMBRO_UPLOAD_MODES.SIMULACION ||
    savedMode === HOMBRO_UPLOAD_MODES.REAL
  ) {
    return savedMode;
  }

  return HOMBRO_UPLOAD_MODES.SIMULACION;
}

export function setHombroUploadMode(mode) {
  if (
    mode !== HOMBRO_UPLOAD_MODES.SIMULACION &&
    mode !== HOMBRO_UPLOAD_MODES.REAL
  ) {
    throw new Error("Modo de carga de hombro no válido.");
  }

  localStorage.setItem(HOMBRO_UPLOAD_MODE_KEY, mode);
}
