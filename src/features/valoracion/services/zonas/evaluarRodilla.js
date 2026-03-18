export function evaluarRodilla(formData) {
  const alertas = [];
  const motivosDescarte = [];

  const intensidadDolorActual = Number(formData.intensidad_dolor_actual || 0);
  const dolorUltimaSemana = Number(formData.dolor_ultima_semana || 0);

  if (intensidadDolorActual >= 8) {
    motivosDescarte.push("Dolor actual en rodilla mayor o igual a 8/10.");
  }

  if (dolorUltimaSemana >= 8) {
    motivosDescarte.push("Dolor en la última semana mayor o igual a 8/10.");
  }

  if (formData.bloqueos === "SI") {
    motivosDescarte.push("Presenta bloqueos en la rodilla.");
  }

  if (formData.fallas === "SI") {
    motivosDescarte.push("Presenta fallas en la rodilla.");
  }

  if (formData.trastorna_descanso === "MUCHO") {
    alertas.push("El dolor trastorna mucho el descanso.");
  }

  if (formData.artrosis_mejora_con === "NADA") {
    alertas.push("El dolor por artrosis no mejora con ninguna medida.");
  }

  if (formData.usa_baston === "SI") {
    alertas.push("Usa bastón para la marcha.");
  }

  if (formData.cojera_por_rodilla === "SI") {
    alertas.push("Presenta cojera al caminar.");
  }

  if (formData.derrame_al_caminar === "MUCHO") {
    alertas.push("Presenta mucho derrame al caminar.");
  }

  if (formData.espera_cirugia === "SI") {
    alertas.push("Se encuentra en espera de cirugía.");
  }

  const descartado = motivosDescarte.length > 0;

  let clasificacion = "SEGUIMIENTO_CLINICO";
  let mensaje =
    "Paciente apto para continuar con anamnesis específica de rodilla.";

  if (descartado) {
    clasificacion = "DESCARTAR";
    mensaje =
      "Paciente no apto para manejo inicial en este flujo por criterios de descarte.";
  } else if (alertas.length > 0) {
    clasificacion = "REQUIERE_REVISION";
    mensaje =
      "Paciente con alertas clínicas. Requiere revisión antes de definir conducta.";
  }

  return {
    zona: "rodilla",
    descartado,
    clasificacion,
    mensaje,
    alertas,
    motivosDescarte,
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
