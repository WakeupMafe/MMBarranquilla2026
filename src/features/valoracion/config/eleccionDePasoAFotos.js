function tieneResultadoValido(value) {
  return Boolean(value?.resultado);
}

function requiereRevision(value) {
  return Boolean(value?.resultado?.requiereRevisionProfesional);
}

/**
 * Decide qué zonas pueden pasar a fotos y cuáles quedan suspendidas.
 *
 * Reglas:
 * - Toda zona evaluada puede haberse enviado a BD desde su propio formulario.
 * - Si requiere revisión profesional, esa zona NO pasa a fotos.
 * - Si no requiere revisión profesional, esa zona SÍ pasa a fotos.
 */
export function eleccionDePasoAFotos(evaluacionesPorZona = {}) {
  const zonasEvaluadasEntries = Object.entries(evaluacionesPorZona);

  const zonasEvaluadas = zonasEvaluadasEntries
    .filter(([, value]) => tieneResultadoValido(value))
    .map(([zona]) => zona);

  const zonasAptasParaFotos = zonasEvaluadasEntries
    .filter(
      ([, value]) => tieneResultadoValido(value) && !requiereRevision(value),
    )
    .map(([zona]) => zona);

  const zonasSuspendidasPorRevision = zonasEvaluadasEntries
    .filter(
      ([, value]) => tieneResultadoValido(value) && requiereRevision(value),
    )
    .map(([zona]) => zona);

  return {
    zonasEvaluadas,
    zonasAptasParaFotos,
    zonasSuspendidasPorRevision,
  };
}
