const STORAGE_KEY = "fotos_upload_mode";

export const FOTO_UPLOAD_MODES = {
  REAL: "real",
  SIMULACION: "simulacion",
};

export function getFotosUploadMode() {
  const value = localStorage.getItem(STORAGE_KEY);

  if (
    value !== FOTO_UPLOAD_MODES.REAL &&
    value !== FOTO_UPLOAD_MODES.SIMULACION
  ) {
    return FOTO_UPLOAD_MODES.SIMULACION;
  }

  return value;
}

export function setFotosUploadMode(mode) {
  if (
    mode !== FOTO_UPLOAD_MODES.REAL &&
    mode !== FOTO_UPLOAD_MODES.SIMULACION
  ) {
    return;
  }

  localStorage.setItem(STORAGE_KEY, mode);
}

export function isFotosUploadRealMode() {
  return getFotosUploadMode() === FOTO_UPLOAD_MODES.REAL;
}

export function isFotosUploadSimulacionMode() {
  return getFotosUploadMode() === FOTO_UPLOAD_MODES.SIMULACION;
}
