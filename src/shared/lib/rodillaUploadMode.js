export const RODILLA_UPLOAD_MODES = {
  SIMULACION: "SIMULACION",
  REAL: "REAL",
};

// 🔥 SIEMPRE REAL
export function getRodillaUploadMode() {
  return RODILLA_UPLOAD_MODES.REAL;
}

// 🔥 DESACTIVADO
export function setRodillaUploadMode() {
  return RODILLA_UPLOAD_MODES.REAL;
}
