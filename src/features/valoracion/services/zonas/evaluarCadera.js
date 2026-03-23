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
    NO_ENTIENDE: "no entiende los ejercicios",
    NO_TIENE_AYUDA: "no tiene ayuda",
    NO_TIENE_EQUIPOS: "no tiene equipos",
  };

  return mapa[valor] || valor || "";
}

export function evaluarCadera(formData) {
  const alertas = [];
  const motivosRevisionProfesional = [];

  const dolor = Number(formData.dolor_semana || 0);

  if (dolor >= 9) {
    motivosRevisionProfesional.push(
      "Nivel de dolor en la última semana mayor o igual a 9/10.",
    );
  } else if (dolor >= 7) {
    alertas.push("Nivel de dolor alto en la última semana.");
  }

  if (esSi(formData.debe_parar_por_dolor)) {
    if (formData.parar_por_dolor_distancia === "MENOS_50") {
      motivosRevisionProfesional.push(
        "Debe parar por dolor antes de 50 metros.",
      );
    } else if (formData.parar_por_dolor_distancia === "ENTRE_50_100") {
      alertas.push("Debe parar por dolor entre 50 y 100 metros.");
    } else if (formData.parar_por_dolor_distancia === "MAS_100") {
      alertas.push(
        "Presenta limitación al caminar, aunque logra superar 100 metros.",
      );
    }
  }

  if (formData.problema_al_caminar === "COJERA") {
    alertas.push("Presenta cojera al caminar.");
  }

  if (formData.problema_al_caminar === "DOLOR") {
    alertas.push("Predomina dolor al caminar.");
  }

  if (formData.problema_al_caminar === "FATIGA") {
    alertas.push("Refiere fatiga al caminar.");
  }

  if (esSi(formData.pendiente_lista_cirugia)) {
    alertas.push("Paciente en espera de procedimiento quirúrgico.");
  }

  if (esSi(formData.pendiente_examen)) {
    alertas.push("Paciente pendiente de examen complementario.");
  }

  if (esSi(formData.en_tratamiento)) {
    alertas.push("Paciente en tratamiento actual.");
  }

  if (esSi(formData.cirugias_previas_cadera)) {
    if (formData.cirugia_antiguedad === "MENOR_5_ANOS") {
      alertas.push("Antecedente de cirugía de cadera menor a 5 años.");
    } else if (formData.cirugia_antiguedad === "MAYOR_5_ANOS") {
      alertas.push("Antecedente de cirugía de cadera mayor a 5 años.");
    }
  }

  if (esSi(formData.falla_cadera)) {
    motivosRevisionProfesional.push(
      "La cadera presenta fallas o sensación de inestabilidad.",
    );
  }

  if (esSi(formData.artrosis_cadera)) {
    alertas.push("Paciente con antecedente de artrosis de cadera.");

    if (formData.tiempo_diagnostico_categoria === "MENOR_6_MESES") {
      alertas.push(
        "Diagnóstico de artrosis con menos de 6 meses de evolución.",
      );
    }

    if (esSi(formData.radiografias_artrosis)) {
      alertas.push("Cuenta con radiografías compatibles con artrosis.");
    }
  }

  if (esSi(formData.hace_ejercicio)) {
    const veces = Number(formData.veces_semana || 0);

    if (veces > 0) {
      alertas.push(
        `Realiza ejercicio por su cuenta ${veces} vez/veces por semana.`,
      );

      if (veces < 3) {
        alertas.push(
          "Frecuencia de ejercicio por cuenta propia menor a 3 veces por semana.",
        );
      }
    }
  }

  if (esSi(formData.hace_terapia_centro)) {
    const terapiaVeces = Number(formData.terapia_veces_semana || 0);

    if (terapiaVeces > 0) {
      alertas.push(
        `Realiza terapia en centro ${terapiaVeces} vez/veces por semana.`,
      );
    } else {
      alertas.push("Realiza terapia en centro.");
    }
  }

  if (esSi(formData.hace_ejercicios_internet)) {
    const internetVeces = Number(formData.internet_veces_semana || 0);

    if (internetVeces > 0) {
      alertas.push(
        `Realiza ejercicios en casa o guiados por internet ${internetVeces} vez/veces por semana.`,
      );
    } else {
      alertas.push("Realiza ejercicios en casa o guiados por internet.");
    }
  }

  if (
    formData.hace_ejercicio === "NO" &&
    formData.hace_terapia_centro === "NO" &&
    formData.hace_ejercicios_internet === "NO" &&
    formData.razon_no_hace_ejercicio
  ) {
    alertas.push(
      `No realiza ejercicios actualmente. Razón reportada: ${formatearRazonNoEjercicio(
        formData.razon_no_hace_ejercicio,
      )}.`,
    );
  }

  const requiereRevisionProfesional = motivosRevisionProfesional.length > 0;

  let clasificacion = "Apto para protocolo de cadera";
  let mensaje = "El caso puede continuar al protocolo fotográfico de cadera.";

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
