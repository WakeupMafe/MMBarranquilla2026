function esSi(value) {
  return (
    String(value || "")
      .trim()
      .toUpperCase() === "SI"
  );
}

function formatearRazonNoEjercicio(valor) {
  const mapa = {
    FALTA_MOTIVACION: "falta de motivación",
    NO_ENTIENDE: "no comprende los ejercicios",
    NO_TIENE_AYUDA: "no cuenta con ayuda",
    NO_TIENE_EQUIPOS: "no dispone de equipos",
  };

  return mapa[valor] || valor || "";
}

export function evaluarLumbar(formData) {
  const alertas = [];
  const motivosRevisionProfesional = [];

  const dolor = Number(formData.dolor_semana || 0);

  // Criterios de posible descarte que requieren validación profesional
  if (dolor >= 9) {
    motivosRevisionProfesional.push(
      "Dolor lumbar en la última semana con intensidad mayor o igual a 9/10.",
    );
  }

  if (
    esSi(formData.debe_parar_por_dolor) &&
    formData.parar_por_dolor_distancia === "MENOS_50"
  ) {
    motivosRevisionProfesional.push(
      "El paciente debe detener la marcha por dolor antes de 50 metros.",
    );
  }

  if (esSi(formData.dolor_agudo_irradia_pierna) && dolor >= 8) {
    motivosRevisionProfesional.push(
      "Dolor lumbar agudo de alta intensidad con irradiación a miembro inferior.",
    );
  }

  // Alertas clínicas
  if (dolor >= 7 && dolor < 9) {
    alertas.push("Dolor lumbar alto en la última semana.");
  }

  if (
    esSi(formData.debe_parar_por_dolor) &&
    formData.parar_por_dolor_distancia === "ENTRE_50_200"
  ) {
    alertas.push("Debe interrumpir la marcha por dolor entre 50 y 200 metros.");
  }

  if (
    esSi(formData.debe_parar_por_dolor) &&
    formData.parar_por_dolor_distancia === "MAS_200"
  ) {
    alertas.push(
      "Presenta limitación funcional para la marcha, aunque supera los 200 metros.",
    );
  }

  if (esSi(formData.usa_medicamentos)) {
    alertas.push(
      "Refiere uso actual de medicamentos para el control del dolor.",
    );
  }

  if (esSi(formData.pendiente_lista_cirugia)) {
    alertas.push(
      "Se encuentra pendiente o en lista para procedimiento quirúrgico.",
    );
  }

  if (esSi(formData.cirugias_previas_columna)) {
    if (formData.cirugia_antiguedad === "MENOR_5_ANOS") {
      alertas.push(
        "Antecedente de cirugía de columna con antigüedad menor a 5 años.",
      );
    } else if (formData.cirugia_antiguedad === "MAYOR_5_ANOS") {
      alertas.push(
        "Antecedente de cirugía de columna con antigüedad mayor a 5 años.",
      );
    }
  }

  if (esSi(formData.radiografias_dano)) {
    alertas.push(
      "Cuenta con estudios imagenológicos con evidencia de alteración estructural.",
    );
  }

  if (formData.tiempo_sintomas === "MENOR_6_MESES") {
    alertas.push("Síntomas lumbares con evolución menor a 6 meses.");
  }

  // Adherencia terapéutica
  if (esSi(formData.hace_terapia_centro)) {
    const veces = Number(formData.terapia_veces_semana || 0);

    if (veces > 0) {
      alertas.push(`Asiste a terapia en centro ${veces} vez/veces por semana.`);
    } else {
      alertas.push("Asiste a terapia en centro.");
    }
  }

  if (esSi(formData.hace_ejercicios_internet)) {
    const veces = Number(formData.internet_veces_semana || 0);

    if (veces > 0) {
      alertas.push(`Realiza ejercicios en casa ${veces} vez/veces por semana.`);
    } else {
      alertas.push("Realiza ejercicios en casa.");
    }
  }

  if (
    formData.hace_terapia_centro === "NO" &&
    formData.hace_ejercicios_internet === "NO" &&
    formData.razon_no_hace_ejercicio
  ) {
    alertas.push(
      `No realiza ejercicios actualmente. Motivo reportado: ${formatearRazonNoEjercicio(
        formData.razon_no_hace_ejercicio,
      )}.`,
    );
  }

  const requiereRevisionProfesional = motivosRevisionProfesional.length > 0;

  let clasificacion = "Apto para protocolo lumbar";
  let mensaje = "El caso puede continuar al protocolo fotográfico lumbar.";

  if (requiereRevisionProfesional) {
    clasificacion =
      "Paciente con criterios de posible descarte — requiere revisión profesional";
    mensaje =
      "El caso presenta hallazgos clínicos de alto riesgo y requiere validación final por parte del profesional antes de autorizar su continuidad en el protocolo fotográfico.";
  } else if (alertas.length > 0) {
    clasificacion = "Apto para protocolo con alertas clínicas";
    mensaje =
      "El caso puede continuar, pero presenta hallazgos clínicos que deben ser tenidos en cuenta durante la revisión profesional.";
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
