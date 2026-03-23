function tieneValor(valor) {
  return String(valor ?? "").trim() !== "";
}

export function validarCadera(formData) {
  const errores = {};

  const camposBase = [
    "dolor_lado",
    "dolor_actividad",
    "diagnostico_cadera",
    "problemas_caminar",
    "dolor_semana",
    "hace_ejercicio",
    "hace_terapia_centro",
    "hace_ejercicios_internet",
  ];

  camposBase.forEach((campo) => {
    if (!tieneValor(formData[campo])) {
      errores[campo] = "Este campo es obligatorio.";
    }
  });

  if (formData.diagnostico_cadera === "SI") {
    if (!tieneValor(formData.tiempo_diagnostico)) {
      errores.tiempo_diagnostico = "Este campo es obligatorio.";
    }

    if (!tieneValor(formData.tiempo_unidad)) {
      errores.tiempo_unidad = "Este campo es obligatorio.";
    }
  }

  if (formData.artrosis_cadera === "SI") {
    if (!tieneValor(formData.artrosis_lado)) {
      errores.artrosis_lado = "Este campo es obligatorio.";
    }

    if (!tieneValor(formData.tiempo_diagnostico_categoria)) {
      errores.tiempo_diagnostico_categoria = "Este campo es obligatorio.";
    }

    if (!tieneValor(formData.radiografias_artrosis)) {
      errores.radiografias_artrosis = "Este campo es obligatorio.";
    }
  }

  if (formData.problemas_caminar === "SI") {
    if (!tieneValor(formData.problema_al_caminar)) {
      errores.problema_al_caminar = "Este campo es obligatorio.";
    }
  }

  if (formData.debe_parar_por_dolor === "SI") {
    if (!tieneValor(formData.parar_por_dolor_distancia)) {
      errores.parar_por_dolor_distancia = "Este campo es obligatorio.";
    }
  }

  if (formData.cirugias_previas_cadera === "SI") {
    if (!tieneValor(formData.cirugia_lado)) {
      errores.cirugia_lado = "Este campo es obligatorio.";
    }

    if (!tieneValor(formData.cirugia_antiguedad)) {
      errores.cirugia_antiguedad = "Este campo es obligatorio.";
    }
  }

  if (formData.hace_ejercicio === "SI") {
    if (!tieneValor(formData.veces_semana)) {
      errores.veces_semana = "Este campo es obligatorio.";
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
    formData.hace_ejercicio === "NO" &&
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

  const veces = Number(formData.veces_semana);
  if (
    tieneValor(formData.veces_semana) &&
    formData.hace_ejercicio === "SI" &&
    (Number.isNaN(veces) || veces < 0)
  ) {
    errores.veces_semana = "Debe ser un valor válido.";
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
