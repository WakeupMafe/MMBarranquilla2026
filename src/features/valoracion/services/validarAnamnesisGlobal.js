export function validarAnamnesisGlobal(data) {
  const errores = {};

  function valorTexto(campo) {
    return String(data[campo] ?? "").trim();
  }

  function requerido(campo, mensaje) {
    if (!valorTexto(campo)) {
      errores[campo] = mensaje;
    }
  }

  function esSi(valor) {
    return (
      String(valor ?? "")
        .trim()
        .toUpperCase() === "SI"
    );
  }

  // =========================
  // 4.1 Estilo de vida
  // =========================
  requerido("horas_sueno", "Debes indicar cuántas horas duerme.");
  requerido(
    "horas_sentado",
    "Debes indicar cuántas horas permanece sentado al día.",
  );
  requerido(
    "horas_movimiento",
    "Debes indicar cuántas horas se mantiene en movimiento al día.",
  );

  // =========================
  // 4.2 Enfermedades metabólicas
  // =========================
  requerido("diabetes", "Debes indicar si presenta diabetes.");
  if (esSi(data.diabetes)) {
    requerido(
      "diabetes_tratamiento",
      "Debes indicar si recibe tratamiento para la diabetes.",
    );
  }

  requerido("hipertension", "Debes indicar si presenta hipertensión.");
  if (esSi(data.hipertension)) {
    requerido(
      "hipertension_tratamiento",
      "Debes indicar si recibe tratamiento para la hipertensión.",
    );
  }

  requerido("colesterol_alto", "Debes indicar si presenta colesterol alto.");
  if (esSi(data.colesterol_alto)) {
    requerido(
      "colesterol_tratamiento",
      "Debes indicar si recibe tratamiento para el colesterol alto.",
    );
  }

  // =========================
  // 4.3 Riesgo cardiovascular
  // =========================
  requerido("infarto", "Debes indicar si ha presentado infarto.");
  if (esSi(data.infarto)) {
    requerido(
      "infarto_menos_3_meses",
      "Debes indicar si el infarto ocurrió hace menos de 3 meses.",
    );
  }

  requerido(
    "evento_cerebrovascular",
    "Debes indicar si ha presentado evento cerebrovascular.",
  );
  if (esSi(data.evento_cerebrovascular)) {
    requerido(
      "ecv_menos_6_meses",
      "Debes indicar si el evento cerebrovascular ocurrió hace menos de 6 meses.",
    );
  }

  // =========================
  // 4.4 Enfermedades sistémicas
  // =========================
  requerido(
    "enfermedad_higado",
    "Debes indicar si presenta enfermedad hepática.",
  );
  requerido("enfermedad_rinon", "Debes indicar si presenta enfermedad renal.");

  requerido("anemia", "Debes indicar si presenta anemia.");
  if (esSi(data.anemia)) {
    requerido(
      "anemia_controlada",
      "Debes indicar si la anemia se encuentra controlada.",
    );
  }

  requerido(
    "enfermedad_autoinmune",
    "Debes indicar si presenta enfermedad autoinmune.",
  );
  requerido(
    "enfermedad_psiquiatrica",
    "Debes indicar si presenta enfermedad psiquiátrica.",
  );
  requerido(
    "cancer_ultimos_5_anos",
    "Debes indicar si ha presentado cáncer en los últimos 5 años.",
  );

  // =========================
  // 4.5 Cirugías
  // =========================
  requerido(
    "cirugia_rodilla",
    "Debes indicar si ha tenido cirugía de rodilla.",
  );
  requerido("cirugia_cadera", "Debes indicar si ha tenido cirugía de cadera.");
  requerido("cirugia_hombro", "Debes indicar si ha tenido cirugía de hombro.");
  requerido(
    "cirugia_columna",
    "Debes indicar si ha tenido cirugía de columna.",
  );
  requerido("cirugia_pelvis", "Debes indicar si ha tenido cirugía de pelvis.");
  requerido("cirugia_otra", "Debes indicar si ha tenido alguna otra cirugía.");

  if (esSi(data.cirugia_otra)) {
    requerido("cirugia_otra_cual", "Debes indicar cuál fue la otra cirugía.");
  }

  if (
    esSi(data.cirugia_rodilla) ||
    esSi(data.cirugia_cadera) ||
    esSi(data.cirugia_hombro) ||
    esSi(data.cirugia_columna) ||
    esSi(data.cirugia_pelvis) ||
    esSi(data.cirugia_otra)
  ) {
    requerido(
      "cirugia_menos_3_meses",
      "Debes indicar si alguna cirugía ocurrió hace menos de 3 meses.",
    );
  }

  // =========================
  // 4.6 Trauma reciente
  // =========================
  requerido(
    "golpe_pelvis",
    "Debes indicar si ha presentado un golpe fuerte en la pelvis.",
  );
  if (esSi(data.golpe_pelvis)) {
    requerido(
      "dolor_pelvis_nivel",
      "Debes indicar el nivel de dolor en pelvis.",
    );
  }

  // =========================
  // 4.7 UCI
  // =========================
  requerido("paso_uci", "Debes indicar si ha permanecido en UCI.");
  if (esSi(data.paso_uci)) {
    requerido(
      "uci_menos_1_ano",
      "Debes indicar si la estancia en UCI ocurrió hace menos de 1 año.",
    );
    requerido("razon_uci", "Debes indicar la razón del ingreso a UCI.");
  }

  // =========================
  // 4.8 Tratamientos oncológicos
  // =========================
  requerido("quimioterapia", "Debes indicar si ha recibido quimioterapia.");
  requerido("radioterapia", "Debes indicar si ha recibido radioterapia.");

  // =========================
  // 4.9 Hábitos
  // =========================
  requerido("fuma", "Debes indicar si fuma.");
  if (esSi(data.fuma)) {
    requerido(
      "cigarrillos_dia",
      "Debes indicar cuántos cigarrillos fuma al día.",
    );
  }

  requerido("toma_licor", "Debes indicar si consume licor.");
  if (esSi(data.toma_licor)) {
    requerido(
      "frecuencia_licor",
      "Debes indicar la frecuencia de consumo de licor.",
    );
  }

  // =========================
  // 5. Dolor por zonas
  // =========================
  requerido("dolor_rodilla", "Debes indicar si presenta dolor en rodilla.");
  requerido("dolor_hombro", "Debes indicar si presenta dolor en hombro.");
  requerido("dolor_cadera", "Debes indicar si presenta dolor en cadera.");
  requerido("dolor_lumbar", "Debes indicar si presenta dolor lumbar.");

  // =========================
  // 5.1 Diagnósticos
  // =========================
  requerido(
    "dx_artrosis_rodilla",
    "Debes indicar si tiene diagnóstico de artrosis de rodilla.",
  );
  requerido(
    "dx_artrosis_cadera",
    "Debes indicar si tiene diagnóstico de artrosis de cadera.",
  );
  requerido(
    "dx_lumbalgia_cronica",
    "Debes indicar si tiene diagnóstico de lumbalgia crónica.",
  );
  requerido(
    "dx_manguito_rotador",
    "Debes indicar si tiene diagnóstico de lesión del manguito rotador.",
  );

  return errores;
}
