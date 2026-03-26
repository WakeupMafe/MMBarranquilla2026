function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function esSi(valor) {
  return (
    String(valor || "")
      .trim()
      .toUpperCase() === "SI"
  );
}

export function evaluarAnamnesisGlobal(formData) {
  const imc = toNumber(formData.imc);
  const obesidad = esSi(formData.obesidad) || (imc !== null && imc >= 30);

  const motivosDescarte = [];
  const alertas = [];
  const zonasDetectadas = [];

  if (obesidad) {
    alertas.push("IMC igual o mayor a 30");
  }

  if (esSi(formData.infarto_menos_3_meses)) {
    motivosDescarte.push("Antecedente de infarto en menos de 3 meses");
  }

  if (esSi(formData.ecv_menos_6_meses)) {
    motivosDescarte.push("Evento cerebrovascular en menos de 6 meses");
  }

  if (esSi(formData.cirugia_menos_3_meses)) {
    motivosDescarte.push("Cirugía en menos de 3 meses");
  }

  if (esSi(formData.golpe_pelvis)) {
    const dolorPelvis = toNumber(formData.dolor_pelvis_nivel);

    if (dolorPelvis !== null && dolorPelvis > 7) {
      motivosDescarte.push(
        "Golpe fuerte en pelvis reciente con dolor mayor a 7",
      );
    }
  }

  if (esSi(formData.dolor_rodilla)) zonasDetectadas.push("rodilla");
  if (esSi(formData.dolor_cadera)) zonasDetectadas.push("cadera");
  if (esSi(formData.dolor_lumbar)) zonasDetectadas.push("lumbar");
  if (esSi(formData.dolor_hombro)) zonasDetectadas.push("hombro");

  const cantidadZonasDolor = zonasDetectadas.length;

  let pendienteAprobacion = false;
  let siguientePaso = "funcional";
  let mensajeResultado = "Paciente apto para pruebas funcionales generales.";

  if (motivosDescarte.length > 0) {
    siguientePaso = "descartado";
    mensajeResultado =
      "Paciente con criterios de descarte. No debe realizar anamnesis de zona ni pruebas videográficas.";
  } else if (cantidadZonasDolor > 3) {
    pendienteAprobacion = true;
    alertas.push(
      "Paciente con más de 3 zonas de dolor. Requiere aprobación médica antes de continuar.",
    );
    mensajeResultado =
      "Paciente pendiente de aprobación médica por múltiples zonas de dolor.";
    siguientePaso = "pendiente_aprobacion";
  } else if (cantidadZonasDolor >= 1 && cantidadZonasDolor <= 3) {
    siguientePaso = "anamnesis_especifica_zona";
    mensajeResultado =
      "Paciente apto para anamnesis de zona en las áreas reportadas.";
  } else {
    siguientePaso = "funcional";
    mensajeResultado = "Paciente sin dolor por zonas. Continúa a funcional.";
  }

  const descartado = siguientePaso === "descartado";

  return {
    imc,
    obesidad,
    alertas,
    descartado,
    motivosDescarte,
    zonasDetectadas,
    cantidadZonasDolor,
    pendienteAprobacion,
    siguientePaso,
    mensajeResultado,
  };
}
