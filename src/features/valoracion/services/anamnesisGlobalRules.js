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

export function calcularImc(peso, talla) {
  const pesoNum = toNumber(peso);
  const tallaNum = toNumber(talla);

  if (!pesoNum || !tallaNum || tallaNum <= 0) {
    return {
      imc: null,
      obesidad: false,
    };
  }

  const imc = pesoNum / (tallaNum * tallaNum);

  return {
    imc: Number(imc.toFixed(2)),
    obesidad: imc >= 30,
  };
}

export function evaluarAnamnesisGlobal(formData) {
  const { imc, obesidad } = calcularImc(formData.peso, formData.talla);

  const motivosDescarte = [];
  const alertas = [];
  const zonasDolor = [];

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

  if (esSi(formData.dolor_rodilla)) zonasDolor.push("rodilla");
  if (esSi(formData.dolor_cadera)) zonasDolor.push("cadera");
  if (esSi(formData.dolor_lumbar)) zonasDolor.push("lumbar");
  if (esSi(formData.dolor_hombro)) zonasDolor.push("hombro");

  const descartado = motivosDescarte.length > 0;

  let siguientePaso = "pruebas_funcionales_generales";

  if (descartado) {
    siguientePaso = "descartado";
  } else if (zonasDolor.length > 0) {
    siguientePaso = "anamnesis_especifica_zona";
  }

  return {
    imc,
    obesidad,
    alertas,
    descartado,
    motivosDescarte,
    zonasDolor,
    siguientePaso,
  };
}
