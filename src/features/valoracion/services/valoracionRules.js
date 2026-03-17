export function esClasificacionSecundariaValida(valor) {
  if (!valor) return false;

  const texto = String(valor).trim().toUpperCase();
  return texto !== "" && texto !== "NO APLICA";
}

export function normalizarTexto(valor) {
  if (valor == null) return "";
  return String(valor).trim().toUpperCase();
}

export function evaluarObjetivosEncuesta(encuesta) {
  if (!encuesta) {
    return {
      encuestaLogrosEstado: "No realizó",
      objetivosCumplidos: false,
      cantidadObjetivos: 0,
      cantidadObjetivosCumplidos: 0,
    };
  }

  const objetivosOriginales = [
    encuesta.obj1_original,
    encuesta.obj2_original,
    encuesta.obj3_original,
  ].filter((valor) => String(valor ?? "").trim() !== "");

  const cantidadObjetivos = objetivosOriginales.length;

  if (cantidadObjetivos === 0) {
    return {
      encuestaLogrosEstado: "No cumplió objetivos",
      objetivosCumplidos: false,
      cantidadObjetivos: 0,
      cantidadObjetivosCumplidos: 0,
    };
  }

  const resultadosNuevos = [
    encuesta.obj1_nuevo,
    encuesta.obj2_nuevo,
    encuesta.obj3_nuevo,
  ];

  const cantidadObjetivosCumplidos = resultadosNuevos.filter(
    (valor) => normalizarTexto(valor) === "OBJETIVO CUMPLIDO",
  ).length;

  const objetivosCumplidos = cantidadObjetivosCumplidos === cantidadObjetivos;

  return {
    encuestaLogrosEstado: objetivosCumplidos
      ? "Cumplió objetivos"
      : "No cumplió objetivos",
    objetivosCumplidos,
    cantidadObjetivos,
    cantidadObjetivosCumplidos,
  };
}
