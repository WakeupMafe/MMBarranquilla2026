export const MODULO_OBESIDAD_UPLOAD_MODES = {
  SIMULACION: "SIMULACION",
  REAL: "REAL",
};

const STORAGE_KEY = "wk_modulo_obesidad_upload_mode";

export function getModuloObesidadUploadMode() {
  const current = localStorage.getItem(STORAGE_KEY);

  if (
    current === MODULO_OBESIDAD_UPLOAD_MODES.REAL ||
    current === MODULO_OBESIDAD_UPLOAD_MODES.SIMULACION
  ) {
    return current;
  }

  return MODULO_OBESIDAD_UPLOAD_MODES.SIMULACION;
}

export function setModuloObesidadUploadMode(mode) {
  if (
    mode !== MODULO_OBESIDAD_UPLOAD_MODES.REAL &&
    mode !== MODULO_OBESIDAD_UPLOAD_MODES.SIMULACION
  ) {
    return;
  }

  localStorage.setItem(STORAGE_KEY, mode);
}
