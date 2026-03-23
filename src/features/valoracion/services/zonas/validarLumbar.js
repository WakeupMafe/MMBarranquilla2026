function tieneValor(valor) {
  return String(valor ?? "").trim() !== "";
}

export function validarLumbar(formData) {
  const errores = {};

  const camposBase = [
    "tiempo_diagnostico",
    "radiografias_dano",
    "tiempo_sintomas",
    "debe_parar_por_dolor",
    "usa_medicamentos",
    "cirugias_previas_columna",
    "pendiente_lista_cirugia",
    "dolor_semana",
    "dolor_agudo_irradia_pierna",
    "hace_terapia_centro",
    "hace_ejercicios_internet",
  ];

  camposBase.forEach((campo) => {
    if (!tieneValor(formData[campo])) {
      errores[campo] = "Este campo es obligatorio.";
    }
  });

  if (formData.debe_parar_por_dolor === "SI") {
    if (!tieneValor(formData.parar_por_dolor_distancia)) {
      errores.parar_por_dolor_distancia = "Este campo es obligatorio.";
    }
  }

  if (formData.cirugias_previas_columna === "SI") {
    if (!tieneValor(formData.cirugia_antiguedad)) {
      errores.cirugia_antiguedad = "Este campo es obligatorio.";
    }
  }

  if (formData.hace_terapia_centro === "SI") {
    if (!tieneValor(formData.terapia_veces_semana)) {
      errores.terapia_veces_semana = "Este campo es obligatorio.";
    }
  }

  if (formData.hace_ejercicios_internet === "SI") {
    if (!tieneValor(formData.internet_veces_semana)) {
      errores.internet_veces_semana = "Este campo es obligatorio.";
    }
  }

  if (
    formData.hace_terapia_centro === "NO" &&
    formData.hace_ejercicios_internet === "NO"
  ) {
    if (!tieneValor(formData.razon_no_hace_ejercicio)) {
      errores.razon_no_hace_ejercicio = "Este campo es obligatorio.";
    }
  }

  const dolor = Number(formData.dolor_semana);
  if (
    tieneValor(formData.dolor_semana) &&
    (Number.isNaN(dolor) || dolor < 0 || dolor > 10)
  ) {
    errores.dolor_semana = "Debe ser un valor entre 0 y 10.";
  }

  const terapiaVeces = Number(formData.terapia_veces_semana);
  if (
    tieneValor(formData.terapia_veces_semana) &&
    formData.hace_terapia_centro === "SI" &&
    (Number.isNaN(terapiaVeces) || terapiaVeces < 1 || terapiaVeces > 4)
  ) {
    errores.terapia_veces_semana = "Debe ser un valor entre 1 y 4.";
  }

  const internetVeces = Number(formData.internet_veces_semana);
  if (
    tieneValor(formData.internet_veces_semana) &&
    formData.hace_ejercicios_internet === "SI" &&
    (Number.isNaN(internetVeces) || internetVeces < 1 || internetVeces > 4)
  ) {
    errores.internet_veces_semana = "Debe ser un valor entre 1 y 4.";
  }

  return errores;
}
