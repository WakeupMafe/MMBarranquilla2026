function isEmpty(value) {
  if (Array.isArray(value)) return value.length === 0;
  return value === "" || value === null || value === undefined;
}

export function validarRodilla(formData) {
  const errores = {};

  // Dolor base
  if (isEmpty(formData.dolor_lado)) {
    errores.dolor_lado = "Debes seleccionar el lado del dolor.";
  }

  if (isEmpty(formData.dolor_localizacion)) {
    errores.dolor_localizacion = "Debes seleccionar la localización del dolor.";
  }

  if (isEmpty(formData.intensidad_dolor_actual)) {
    errores.intensidad_dolor_actual = "Debes ingresar la intensidad del dolor.";
  } else if (
    Number(formData.intensidad_dolor_actual) < 0 ||
    Number(formData.intensidad_dolor_actual) > 10
  ) {
    errores.intensidad_dolor_actual =
      "La intensidad del dolor debe estar entre 0 y 10.";
  }

  if (isEmpty(formData.horas_dolor_dia)) {
    errores.horas_dolor_dia = "Debes indicar cuántas horas al día duele.";
  }

  if (isEmpty(formData.momento_dolor)) {
    errores.momento_dolor = "Debes indicar el momento del dolor.";
  }

  if (isEmpty(formData.mejora_con)) {
    errores.mejora_con = "Debes seleccionar al menos una opción.";
  }

  if (
    Array.isArray(formData.mejora_con) &&
    formData.mejora_con.includes("OTRO") &&
    isEmpty(formData.mejora_con_otro)
  ) {
    errores.mejora_con_otro = "Debes especificar cuál otro.";
  }

  if (isEmpty(formData.dolor_inicial_mejora)) {
    errores.dolor_inicial_mejora = "Debes ingresar el dolor inicial.";
  } else if (
    Number(formData.dolor_inicial_mejora) < 0 ||
    Number(formData.dolor_inicial_mejora) > 10
  ) {
    errores.dolor_inicial_mejora = "El dolor inicial debe estar entre 0 y 10.";
  }

  if (isEmpty(formData.dolor_final_mejora)) {
    errores.dolor_final_mejora = "Debes ingresar el dolor final.";
  } else if (
    Number(formData.dolor_final_mejora) < 0 ||
    Number(formData.dolor_final_mejora) > 10
  ) {
    errores.dolor_final_mejora = "El dolor final debe estar entre 0 y 10.";
  }

  if (isEmpty(formData.trastorna_descanso)) {
    errores.trastorna_descanso = "Debes indicar si trastorna el descanso.";
  }

  if (isEmpty(formData.crepito_ruido)) {
    errores.crepito_ruido = "Debes indicar si presenta crépito o ruido.";
  }

  if (isEmpty(formData.al_caminar_sintoma)) {
    errores.al_caminar_sintoma = "Debes seleccionar el síntoma al caminar.";
  }

  // Artrosis
  if (isEmpty(formData.tiene_artrosis_diagnostico)) {
    errores.tiene_artrosis_diagnostico =
      "Debes indicar si tiene diagnóstico de artrosis.";
  }

  if (formData.tiene_artrosis_diagnostico === "SI") {
    if (isEmpty(formData.artrosis_lado)) {
      errores.artrosis_lado = "Debes indicar el lado de la artrosis.";
    }

    if (isEmpty(formData.tiempo_diagnostico_valor)) {
      errores.tiempo_diagnostico_valor =
        "Debes indicar el tiempo de diagnóstico.";
    }

    if (isEmpty(formData.tiempo_diagnostico_unidad)) {
      errores.tiempo_diagnostico_unidad = "Debes indicar si son meses o años.";
    }

    if (isEmpty(formData.tiene_radiografia_artrosis)) {
      errores.tiene_radiografia_artrosis =
        "Debes indicar si tiene radiografías.";
    }

    if (isEmpty(formData.sintomas_mayor_6_meses)) {
      errores.sintomas_mayor_6_meses =
        "Debes indicar si tiene síntomas mayores a 6 meses.";
    }

    if (isEmpty(formData.problemas_caminar)) {
      errores.problemas_caminar =
        "Debes indicar si tiene problemas para caminar.";
    }

    if (isEmpty(formData.tratamiento_artrosis)) {
      errores.tratamiento_artrosis = "Debes seleccionar el tratamiento actual.";
    }

    if (isEmpty(formData.cirugia_artrosis_tiempo)) {
      errores.cirugia_artrosis_tiempo =
        "Debes indicar el tiempo de cirugía o si no aplica.";
    }

    if (isEmpty(formData.dolor_ultima_semana)) {
      errores.dolor_ultima_semana =
        "Debes indicar el dolor en la última semana.";
    } else if (
      Number(formData.dolor_ultima_semana) < 0 ||
      Number(formData.dolor_ultima_semana) > 10
    ) {
      errores.dolor_ultima_semana =
        "El dolor de la última semana debe estar entre 0 y 10.";
    }

    if (isEmpty(formData.parar_por_dolor_distancia)) {
      errores.parar_por_dolor_distancia =
        "Debes indicar la distancia antes de parar por dolor.";
    }

    if (isEmpty(formData.limita_descanso)) {
      errores.limita_descanso = "Debes indicar cuánto limita el descanso.";
    }

    if (isEmpty(formData.artrosis_mejora_con)) {
      errores.artrosis_mejora_con = "Debes indicar con qué mejora el dolor.";
    }

    if (
      formData.artrosis_mejora_con === "OTRO" &&
      isEmpty(formData.artrosis_mejora_con_otro)
    ) {
      errores.artrosis_mejora_con_otro = "Debes especificar cuál otro.";
    }

    if (isEmpty(formData.artrosis_dolor_inicial)) {
      errores.artrosis_dolor_inicial = "Debes ingresar el dolor inicial.";
    } else if (
      Number(formData.artrosis_dolor_inicial) < 0 ||
      Number(formData.artrosis_dolor_inicial) > 10
    ) {
      errores.artrosis_dolor_inicial =
        "El dolor inicial debe estar entre 0 y 10.";
    }

    if (isEmpty(formData.artrosis_dolor_final)) {
      errores.artrosis_dolor_final = "Debes ingresar el dolor final.";
    } else if (
      Number(formData.artrosis_dolor_final) < 0 ||
      Number(formData.artrosis_dolor_final) > 10
    ) {
      errores.artrosis_dolor_final = "El dolor final debe estar entre 0 y 10.";
    }
  }

  // Síntomas asociados
  if (isEmpty(formData.derrame_al_caminar)) {
    errores.derrame_al_caminar = "Debes indicar el derrame al caminar.";
  }

  if (isEmpty(formData.dolor_al_caminar)) {
    errores.dolor_al_caminar = "Debes indicar el dolor al caminar.";
  } else if (
    Number(formData.dolor_al_caminar) < 0 ||
    Number(formData.dolor_al_caminar) > 10
  ) {
    errores.dolor_al_caminar = "El dolor al caminar debe estar entre 0 y 10.";
  }

  if (isEmpty(formData.cojera_por_rodilla)) {
    errores.cojera_por_rodilla = "Debes indicar si presenta cojera.";
  }

  if (isEmpty(formData.usa_baston)) {
    errores.usa_baston = "Debes indicar si usa bastón.";
  }

  if (isEmpty(formData.bloqueos)) {
    errores.bloqueos = "Debes indicar si presenta bloqueos.";
  }

  if (isEmpty(formData.fallas)) {
    errores.fallas = "Debes indicar si presenta fallas.";
  }

  // Ejercicio
  if (isEmpty(formData.hace_ejercicios)) {
    errores.hace_ejercicios = "Debes indicar si hace ejercicios.";
  }

  if (formData.hace_ejercicios === "SI") {
    if (isEmpty(formData.tipo_ejercicio)) {
      errores.tipo_ejercicio =
        "Debes indicar si son ejercicios solos o dirigidos.";
    }

    if (isEmpty(formData.veces_ejercicio_semana)) {
      errores.veces_ejercicio_semana =
        "Debes indicar cuántas veces por semana.";
    }

    if (
      Number(formData.veces_ejercicio_semana) < 3 &&
      isEmpty(formData.razon_menos_3_semana)
    ) {
      errores.razon_menos_3_semana =
        "Debes indicar la razón de hacer ejercicio menos de 3 veces.";
    }
  }

  if (isEmpty(formData.hace_cardio)) {
    errores.hace_cardio = "Debes indicar si hace ejercicio cardiovascular.";
  }

  if (formData.hace_cardio === "SI") {
    if (isEmpty(formData.tipo_cardio)) {
      errores.tipo_cardio = "Debes indicar el tipo de cardio.";
    }

    if (formData.tipo_cardio === "OTRO" && isEmpty(formData.tipo_cardio_otro)) {
      errores.tipo_cardio_otro = "Debes especificar cuál otro.";
    }

    if (isEmpty(formData.veces_cardio_semana)) {
      errores.veces_cardio_semana =
        "Debes indicar cuántas veces hace cardio por semana.";
    }
  }

  // Estado adicional
  if (isEmpty(formData.derrame_general)) {
    errores.derrame_general = "Debes indicar el derrame general.";
  }

  if (isEmpty(formData.diagnostico_confirmado)) {
    errores.diagnostico_confirmado =
      "Debes indicar si tiene diagnóstico confirmado.";
  }

  if (isEmpty(formData.pendiente_examen)) {
    errores.pendiente_examen = "Debes indicar si está pendiente examen.";
  }

  if (isEmpty(formData.en_tratamiento)) {
    errores.en_tratamiento = "Debes indicar si está en tratamiento.";
  }

  if (isEmpty(formData.espera_cita_manejo)) {
    errores.espera_cita_manejo = "Debes indicar si espera cita para manejo.";
  }

  if (isEmpty(formData.espera_cirugia)) {
    errores.espera_cirugia = "Debes indicar si espera cirugía.";
  }

  return errores;
}
