export function validarAnamnesisGlobal(data) {
  const errores = {};

  function requerido(campo, mensaje) {
    if (!String(data[campo] ?? "").trim()) {
      errores[campo] = mensaje;
    }
  }

  // 4.1 Estilo de vida
  requerido("horas_sueno", "Debes indicar cuántas horas duerme");
  requerido("horas_sentado", "Debes seleccionar horas sentado");
  requerido("horas_movimiento", "Debes seleccionar horas de movimiento");

  // 4.2 Enfermedades metabólicas
  requerido("diabetes", "Debes indicar si tiene diabetes");
  if (data.diabetes === "SI") {
    requerido(
      "diabetes_tratamiento",
      "Debes indicar si tiene tratamiento para diabetes",
    );
  }

  requerido("hipertension", "Debes indicar si sufre de hipertensión");
  if (data.hipertension === "SI") {
    requerido(
      "hipertension_tratamiento",
      "Debes indicar si tiene tratamiento para hipertensión",
    );
  }

  requerido("colesterol_alto", "Debes indicar si sufre de colesterol alto");
  if (data.colesterol_alto === "SI") {
    requerido(
      "colesterol_tratamiento",
      "Debes indicar si tiene tratamiento para colesterol alto",
    );
  }

  // 4.3 Obesidad
  requerido("peso", "Debes ingresar el peso");
  requerido("talla", "Debes ingresar la talla");

  // 4.4 Riesgo cardiovascular
  requerido("infarto", "Debes indicar si ha tenido infarto");
  if (data.infarto === "SI") {
    requerido(
      "infarto_menos_3_meses",
      "Debes indicar si fue hace menos de 3 meses",
    );
  }

  requerido(
    "evento_cerebrovascular",
    "Debes indicar si ha tenido evento cerebrovascular",
  );
  if (data.evento_cerebrovascular === "SI") {
    requerido(
      "ecv_menos_6_meses",
      "Debes indicar si fue hace menos de 6 meses",
    );
  }

  // 4.5 Enfermedades sistémicas
  requerido(
    "enfermedad_higado",
    "Debes indicar si sufre enfermedad del hígado",
  );
  requerido("enfermedad_rinon", "Debes indicar si sufre enfermedad del riñón");
  requerido("anemia", "Debes indicar si tiene anemia");
  if (data.anemia === "SI") {
    requerido(
      "anemia_controlada",
      "Debes indicar si la anemia está controlada",
    );
  }

  requerido(
    "enfermedad_autoinmune",
    "Debes indicar si tiene enfermedad autoinmune",
  );
  requerido(
    "enfermedad_psiquiatrica",
    "Debes indicar si tiene enfermedad psiquiátrica",
  );
  requerido(
    "cancer_ultimos_5_anos",
    "Debes indicar si ha tenido cáncer en los últimos 5 años",
  );

  // 4.6 Procedimientos recientes
  requerido("cirugia_rodilla", "Debes indicar cirugía de rodilla");
  requerido("cirugia_cadera", "Debes indicar cirugía de cadera");
  requerido("cirugia_hombro", "Debes indicar cirugía de hombro");
  requerido("cirugia_columna", "Debes indicar cirugía de columna");
  requerido("cirugia_pelvis", "Debes indicar cirugía de pelvis");
  requerido("cirugia_otra", "Debes indicar si tuvo otra cirugía");

  if (data.cirugia_otra === "SI") {
    requerido("cirugia_otra_cual", "Debes indicar cuál cirugía");
  }

  if (
    data.cirugia_rodilla === "SI" ||
    data.cirugia_cadera === "SI" ||
    data.cirugia_hombro === "SI" ||
    data.cirugia_columna === "SI" ||
    data.cirugia_pelvis === "SI" ||
    data.cirugia_otra === "SI"
  ) {
    requerido(
      "cirugia_menos_3_meses",
      "Debes indicar si la cirugía fue hace menos de 3 meses",
    );
  }

  // 4.7 Trauma reciente
  requerido(
    "golpe_pelvis",
    "Debes indicar si ha tenido golpe fuerte en pelvis",
  );
  if (data.golpe_pelvis === "SI") {
    requerido(
      "dolor_pelvis_nivel",
      "Debes indicar el nivel de dolor en pelvis",
    );
  }

  // 4.8 UCI
  requerido("paso_uci", "Debes indicar si ha permanecido en UCI");
  if (data.paso_uci === "SI") {
    requerido("uci_menos_1_ano", "Debes indicar si fue hace menos de 1 año");
    requerido("razon_uci", "Debes indicar la razón de la UCI");
  }

  // 4.9 Oncológicos
  requerido("quimioterapia", "Debes indicar si ha recibido quimioterapia");
  requerido("radioterapia", "Debes indicar si ha recibido radioterapia");

  // 4.10 Hábitos
  requerido("fuma", "Debes indicar si fuma");
  if (data.fuma === "SI") {
    requerido(
      "cigarrillos_dia",
      "Debes indicar cuántos cigarrillos fuma al día",
    );
  }

  requerido("toma_licor", "Debes indicar si toma licor");
  if (data.toma_licor === "SI") {
    requerido("frecuencia_licor", "Debes indicar la frecuencia de licor");
  }

  // 5. Dolor
  requerido("dolor_rodilla", "Debes indicar si tiene dolor en rodillas");
  requerido("dolor_hombro", "Debes indicar si tiene dolor en hombros");
  requerido("dolor_cadera", "Debes indicar si tiene dolor en cadera");
  requerido("dolor_lumbar", "Debes indicar si tiene dolor lumbar");

  // 5.1 Diagnósticos específicos
  requerido(
    "dx_artrosis_rodilla",
    "Debes indicar si tiene diagnóstico de artrosis de rodilla",
  );
  requerido(
    "dx_artrosis_cadera",
    "Debes indicar si tiene diagnóstico de artrosis de cadera",
  );
  requerido(
    "dx_lumbalgia_cronica",
    "Debes indicar si tiene diagnóstico de lumbalgia crónica",
  );
  requerido(
    "dx_manguito_rotador",
    "Debes indicar si tiene diagnóstico de daño de manguito rotador",
  );

  return errores;
}
