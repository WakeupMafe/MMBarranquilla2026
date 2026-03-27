export const HOMBRO_UPLOAD_MODES = {
  SIMULACION: "SIMULACION",
  REAL: "REAL",
};

// 🔥 SIEMPRE REAL
export function getHombroUploadMode() {
  return HOMBRO_UPLOAD_MODES.REAL;
}

// 🔥 DESACTIVADO
export function setHombroUploadMode() {
  return HOMBRO_UPLOAD_MODES.REAL;
}
