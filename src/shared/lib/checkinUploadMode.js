export const CHECKIN_UPLOAD_MODES = {
  SIMULACION: "SIMULACION",
  REAL: "REAL",
};

const STORAGE_KEY = "wk_checkin_upload_mode";

export function getCheckinUploadMode() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (
    saved === CHECKIN_UPLOAD_MODES.REAL ||
    saved === CHECKIN_UPLOAD_MODES.SIMULACION
  ) {
    return saved;
  }

  return CHECKIN_UPLOAD_MODES.SIMULACION;
}

export function setCheckinUploadMode(mode) {
  if (
    mode !== CHECKIN_UPLOAD_MODES.REAL &&
    mode !== CHECKIN_UPLOAD_MODES.SIMULACION
  ) {
    throw new Error("Modo de check-in inválido.");
  }

  localStorage.setItem(STORAGE_KEY, mode);
}
