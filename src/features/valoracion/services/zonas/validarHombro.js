function tieneValor(valor) {
  return String(valor ?? "").trim() !== "";
}

export function validarHombro(formData) {
  const errores = {};

  const camposBase = ["dolor_semana", "dolor_para", "limitacion_funcional"];

  camposBase.forEach((campo) => {
    if (!tieneValor(formData[campo])) {
      errores[campo] = "Este campo es obligatorio.";
    }
  });

  const dolor = Number(formData.dolor_semana);
  if (
    tieneValor(formData.dolor_semana) &&
    (Number.isNaN(dolor) || dolor < 0 || dolor > 10)
  ) {
    errores.dolor_semana = "Debe ser un valor entre 0 y 10.";
  }

  return errores;
}
