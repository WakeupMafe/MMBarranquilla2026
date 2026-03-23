export function evaluarRodilla(formData) {
  const alertas = [];
  const motivosRevisionProfesional = [];

  const intensidadDolorActual = Number(formData.intensidad_dolor_actual || 0);
  const dolorUltimaSemana = Number(formData.dolor_ultima_semana || 0);

  if (intensidadDolorActual >= 8) {
    motivosRevisionProfesional.push(
      "Dolor actual en rodilla con intensidad mayor o igual a 8/10.",
    );
  }

  if (dolorUltimaSemana >= 8) {
    motivosRevisionProfesional.push(
      "Dolor en rodilla durante la última semana con intensidad mayor o igual a 8/10.",
    );
  }

  if (formData.bloqueos === "SI") {
    motivosRevisionProfesional.push(
      "Presencia de bloqueos articulares en la rodilla.",
    );
  }

  if (formData.fallas === "SI") {
    motivosRevisionProfesional.push(
      "Presencia de fallas o inestabilidad en la rodilla.",
    );
  }

  if (formData.trastorna_descanso === "MUCHO") {
    alertas.push("El dolor altera de forma importante el descanso.");
  }

  if (formData.artrosis_mejora_con === "NADA") {
    alertas.push(
      "El dolor asociado a artrosis no presenta mejoría con las medidas reportadas.",
    );
  }

  if (formData.usa_baston === "SI") {
    alertas.push("Requiere bastón para la marcha.");
  }

  if (formData.cojera_por_rodilla === "SI") {
    alertas.push("Presenta cojera durante la marcha.");
  }

  if (formData.derrame_al_caminar === "MUCHO") {
    alertas.push("Presenta derrame importante al caminar.");
  }

  if (formData.espera_cirugia === "SI") {
    alertas.push("Se encuentra en espera de cirugía.");
  }

  const requiereRevisionProfesional = motivosRevisionProfesional.length > 0;

  let clasificacion = "Apto para protocolo de rodilla";
  let mensaje = "El caso puede continuar al protocolo fotográfico de rodilla.";

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
    zona: "rodilla",
    descartado: false,
    requiereRevisionProfesional,
    clasificacion,
    mensaje,
    alertas,
    motivosRevisionProfesional,
    resumen: {
      dolorActual: intensidadDolorActual,
      dolorUltimaSemana,
      tieneArtrosis: formData.tiene_artrosis_diagnostico === "SI",
      bloqueos: formData.bloqueos === "SI",
      fallas: formData.fallas === "SI",
      usaBaston: formData.usa_baston === "SI",
    },
  };
}
