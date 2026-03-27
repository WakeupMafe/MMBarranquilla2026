export const FOTO_UPLOAD_MODES = {
  REAL: "real",
  SIMULACION: "simulacion",
};

// 🔥 SIEMPRE REAL
export function getFotosUploadMode() {
  return FOTO_UPLOAD_MODES.REAL;
}

// 🔥 DESACTIVADO
export function setFotosUploadMode() {
  return FOTO_UPLOAD_MODES.REAL;
}

// 🔥 SIEMPRE TRUE
export function isFotosUploadRealMode() {
  return true;
}

// 🔥 SIEMPRE FALSE
export function isFotosUploadSimulacionMode() {
  return false;
}
