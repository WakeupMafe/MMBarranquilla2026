export const RODILLA_UPLOAD_MODES = {
  SIMULACION: "SIMULACION",
  REAL: "REAL",
};

const STORAGE_KEY = "rodilla_upload_mode";

export function getRodillaUploadMode() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === RODILLA_UPLOAD_MODES.REAL
    ? RODILLA_UPLOAD_MODES.REAL
    : RODILLA_UPLOAD_MODES.SIMULACION;
}

export function setRodillaUploadMode(mode) {
  if (!Object.values(RODILLA_UPLOAD_MODES).includes(mode)) return;
  localStorage.setItem(STORAGE_KEY, mode);
}
