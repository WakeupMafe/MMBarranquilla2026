import { extraerZonasCanonDesdePatologiaRelacionada } from "./mapearPatologiaRelacionadaAZona";

function normalizarZonaParaNavegacion(zona) {
  const value = String(zona || "")
    .trim()
    .toUpperCase();

  if (!value) return null;
  if (value.includes("HOMBRO")) return "hombro";
  if (value.includes("RODILLA")) return "rodilla";
  if (value.includes("CADERA")) return "cadera";
  if (value.includes("ESPALDA") || value.includes("LUMBAR")) return "lumbar";
  if (value.includes("FUNCIONAL")) return "funcional";

  return String(zona || "")
    .trim()
    .toLowerCase();
}

function obtenerTodasLasZonasBase() {
  return ["hombro", "rodilla", "cadera", "lumbar"];
}

export function obtenerZonasCambioDisponibles(clasificacionPaciente) {
  const preliminar = normalizarZonaParaNavegacion(
    clasificacionPaciente?.zonaDestino,
  );

  const secundaria = normalizarZonaParaNavegacion(
    clasificacionPaciente?.zonaSecundaria,
  );

  return obtenerTodasLasZonasBase().filter((zona) => {
    if (zona === preliminar) return false;
    if (zona === secundaria) return false;
    return true;
  });
}

export function formatearNombreZona(zona) {
  const mapa = {
    hombro: "Hombro",
    rodilla: "Rodilla",
    cadera: "Cadera",
    lumbar: "Lumbar",
    funcional: "Funcional",
  };

  return mapa[zona] || zona;
}

/**
 * Texto para "Ruta sugerida" en UI: prioriza zonas inferidas de `patologia_relacionada`
 * (asistencia); si no hay mapeo, muestra el texto crudo; si no hay, la zona destino del flujo.
 */
export function obtenerTextoRutaSugerida(clasificacionPaciente) {
  if (!clasificacionPaciente) return "Sin dato";

  const raw = String(
    clasificacionPaciente.patologiaRelacionadaDesdeAsistencia || "",
  ).trim();

  const desdePatologia = extraerZonasCanonDesdePatologiaRelacionada(raw);
  if (desdePatologia.length > 0) {
    return desdePatologia.map((z) => formatearNombreZona(z)).join(", ");
  }

  if (raw) return raw;

  const z = normalizarZonaParaNavegacion(clasificacionPaciente.zonaDestino);
  if (z) return formatearNombreZona(z);

  return "Sin dato";
}

function pushOpcionesContinuarConZonaDirectoFotos({
  clasificacionPaciente,
  zonaActual,
  opciones,
}) {
  const zonasPat = extraerZonasCanonDesdePatologiaRelacionada(
    clasificacionPaciente?.patologiaRelacionadaDesdeAsistencia,
  );
  const seen = new Set();

  const pushContinuarFotos = (zona, idPart) => {
    if (!zona || seen.has(zona)) return;
    seen.add(zona);
    opciones.push({
      value: `fotos_continuar_${idPart}_${zona}`,
      label: `Continuar con ${formatearNombreZona(zona)}`,
      tipo: "fotos",
      zona,
    });
  };

  zonasPat.forEach((z, i) => pushContinuarFotos(z, `pat${i}`));
  if (zonaActual) pushContinuarFotos(zonaActual, "act");
  if (!seen.has("funcional")) pushContinuarFotos("funcional", "fun");
}

function labelFotosZonaSugeridaEncuesta(clasificacionPaciente, zonaActual) {
  const etiqueta = clasificacionPaciente?.etiquetaZonaOpcionesContinuidad;
  const canon =
    clasificacionPaciente?.zonaCanonDesdePatologiaAsistencia ||
    clasificacionPaciente?.zonaCanonDesdePatologiaEncuesta;
  if (etiqueta && canon && zonaActual === canon) {
    return `Continuar con ${etiqueta} (ir a fotos)`;
  }
  return null;
}

export function construirOpcionesContinuidad({
  resultado,
  clasificacionPaciente,
}) {
  const siguientePaso = resultado?.siguientePaso;
  const zonaActual = normalizarZonaParaNavegacion(
    clasificacionPaciente?.zonaDestino,
  );
  const zonaSecundaria = normalizarZonaParaNavegacion(
    clasificacionPaciente?.zonaSecundaria,
  );
  const zonasDisponiblesCambio = obtenerZonasCambioDisponibles(
    clasificacionPaciente,
  );

  const esPacienteNuevo = !!clasificacionPaciente?.esPacienteNuevo;
  const zonasDetectadas = Array.isArray(resultado?.zonasDetectadas)
    ? resultado.zonasDetectadas
    : [];

  const opciones = [];

  if (siguientePaso === "funcional") {
    opciones.push({
      value: "fotos_funcional",
      label: "Continuar con Funcional",
      tipo: "fotos",
      zona: "funcional",
    });
    return opciones;
  }

  if (siguientePaso === "anamnesis_especifica_zona") {
    // Paciente nuevo:
    // no mostrar opciones cuando va directo a las zonas detectadas.
    if (esPacienteNuevo) {
      return [];
    }

    zonasDetectadas.forEach((zona) => {
      opciones.push({
        value: `anamnesis_${zona}`,
        label: `Abrir anamnesis de ${formatearNombreZona(zona)}`,
        tipo: "anamnesis_zona",
        zona,
      });
    });

    return opciones;
  }

  if (siguientePaso === "decision_reinicia_zona_o_cambio") {
    if (zonaActual) {
      const labelSugerida = labelFotosZonaSugeridaEncuesta(
        clasificacionPaciente,
        zonaActual,
      );
      opciones.push({
        value: `fotos_${zonaActual}`,
        label:
          labelSugerida ||
          `Continuar con ${formatearNombreZona(zonaActual)}`,
        tipo: "fotos",
        zona: zonaActual,
      });
    }

    zonasDisponiblesCambio.forEach((zona) => {
      opciones.push({
        value: `cambio_${zona}`,
        label: `Cambiar a zona: ${formatearNombreZona(zona)}`,
        tipo: "anamnesis_zona",
        zona,
      });
    });

    return opciones;
  }

  if (siguientePaso === "decision_fotos_preliminar_o_secundaria") {
    if (zonaActual) {
      const labelSugerida = labelFotosZonaSugeridaEncuesta(
        clasificacionPaciente,
        zonaActual,
      );
      opciones.push({
        value: `fotos_${zonaActual}`,
        label:
          labelSugerida ||
          `Continuar con ${formatearNombreZona(zonaActual)}`,
        tipo: "fotos",
        zona: zonaActual,
      });
    }

    if (zonaSecundaria) {
      opciones.push({
        value: `fotos_${zonaSecundaria}`,
        label: `Activar segundo diagnóstico: ${formatearNombreZona(zonaSecundaria)}`,
        tipo: "fotos",
        zona: zonaSecundaria,
      });
    }

    zonasDisponiblesCambio.forEach((zona) => {
      opciones.push({
        value: `cambio_${zona}`,
        label: `Cambiar a zona: ${formatearNombreZona(zona)}`,
        tipo: "anamnesis_zona",
        zona,
      });
    });

    return opciones;
  }

  if (siguientePaso === "decision_fotos_preliminar_o_funcional") {
    if (zonaActual && zonaActual !== "funcional") {
      const labelSugerida = labelFotosZonaSugeridaEncuesta(
        clasificacionPaciente,
        zonaActual,
      );
      opciones.push({
        value: `fotos_${zonaActual}`,
        label:
          labelSugerida ||
          `Continuar con ${formatearNombreZona(zonaActual)}`,
        tipo: "fotos",
        zona: zonaActual,
      });
    }

    opciones.push({
      value: "fotos_funcional",
      label: "Continuar con Funcional",
      tipo: "fotos",
      zona: "funcional",
    });

    zonasDisponiblesCambio.forEach((zona) => {
      opciones.push({
        value: `cambio_${zona}`,
        label: `Cambiar a zona: ${formatearNombreZona(zona)}`,
        tipo: "anamnesis_zona",
        zona,
      });
    });

    return opciones;
  }

  if (siguientePaso === "decision_funcional_actual_o_cambio") {
    pushOpcionesContinuarConZonaDirectoFotos({
      clasificacionPaciente,
      zonaActual,
      opciones,
    });

    zonasDisponiblesCambio.forEach((zona) => {
      opciones.push({
        value: `cambio_${zona}`,
        label: `Cambiar a zona: ${formatearNombreZona(zona)}`,
        tipo: "anamnesis_zona",
        zona,
      });
    });

    return opciones;
  }

  if (siguientePaso === "decision_antiguo_funcional_actual_o_cambio") {
    pushOpcionesContinuarConZonaDirectoFotos({
      clasificacionPaciente,
      zonaActual,
      opciones,
    });

    zonasDisponiblesCambio.forEach((zona) => {
      opciones.push({
        value: `cambio_${zona}`,
        label: `Cambiar a zona: ${formatearNombreZona(zona)}`,
        tipo: "anamnesis_zona",
        zona,
      });
    });

    return opciones;
  }

  if (siguientePaso === "decision_zona_o_funcional") {
    zonasDetectadas.forEach((zona) => {
      opciones.push({
        value: `anamnesis_${zona}`,
        label: `Continuar intervención específica: ${formatearNombreZona(zona)}`,
        tipo: "anamnesis_zona",
        zona,
      });
    });

    opciones.push({
      value: "fotos_funcional",
      label: "Continuar con Funcional",
      tipo: "fotos",
      zona: "funcional",
    });

    return opciones;
  }

  return opciones;
}
