export function evaluarHombro(formData) {
  const alertas = [];
  const motivosRevisionProfesional = [];

  const dolor = Number(formData.dolor_semana || 0);

  if (dolor >= 9) {
    motivosRevisionProfesional.push(
      "Nivel de dolor en hombro en la última semana mayor o igual a 9/10.",
    );
  } else if (dolor >= 7) {
    alertas.push("Nivel de dolor alto en hombro en la última semana.");
  }

  if (formData.dolor_para === "DORMIR") {
    alertas.push("Refiere dolor al dormir.");
  }

  if (formData.dolor_para === "LEVANTAR_BRAZO") {
    alertas.push("Refiere dolor al levantar el brazo.");
  }

  if (formData.limitacion_funcional === "ELEVAR_BRAZOS") {
    alertas.push("Presenta limitación funcional para elevar los brazos.");
  }

  if (formData.limitacion_funcional === "ATARSE_SOSTEN") {
    alertas.push("Presenta limitación funcional para atarse el sostén.");
  }

  if (formData.limitacion_funcional === "VESTIRSE") {
    alertas.push("Presenta limitación funcional para vestirse.");
  }

  if (formData.limitacion_funcional === "DORMIR_DE_LADO") {
    alertas.push("Presenta limitación funcional para dormir de lado.");
  }

  const requiereRevisionProfesional = motivosRevisionProfesional.length > 0;

  let clasificacion = "Apto para protocolo de hombro";
  let mensaje = "El caso puede continuar al protocolo fotográfico de hombro.";

  if (requiereRevisionProfesional) {
    clasificacion =
      "Paciente potencialmente para descarte — requiere revisión profesional";
    mensaje =
      "El caso presenta hallazgos clínicos de alto riesgo. Debe ser revisado por un profesional antes de autorizar el protocolo fotográfico.";
  } else if (alertas.length > 0) {
    clasificacion = "Apto para protocolo con alertas";
    mensaje =
      "El caso puede continuar, pero presenta alertas clínicas que deben ser revisadas por el profesional.";
  }

  return {
    clasificacion,
    descartado: false,
    requiereRevisionProfesional,
    mensaje,
    alertas,
    motivosRevisionProfesional,
  };
}
