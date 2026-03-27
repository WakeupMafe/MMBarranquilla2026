export const CADERA_UPLOAD_MODES = {
  SIMULACION: "SIMULACION",
  REAL: "REAL",
};

// 🔥 SIEMPRE REAL
export function getCaderaUploadMode() {
  return CADERA_UPLOAD_MODES.REAL;
}

// 🔥 DESACTIVADO
export function setCaderaUploadMode() {
  return CADERA_UPLOAD_MODES.REAL;
}
