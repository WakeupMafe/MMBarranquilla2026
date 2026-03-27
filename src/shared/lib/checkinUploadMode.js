export const CHECKIN_UPLOAD_MODES = {
  SIMULACION: "SIMULACION",
  REAL: "REAL",
};

// 🔥 SIEMPRE REAL
export function getCheckinUploadMode() {
  return CHECKIN_UPLOAD_MODES.REAL;
}

// 🔥 NO HACE NADA (desactivado)
export function setCheckinUploadMode() {
  return CHECKIN_UPLOAD_MODES.REAL;
}
