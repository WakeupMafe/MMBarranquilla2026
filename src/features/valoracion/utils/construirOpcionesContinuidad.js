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

  const opciones = [];

  if (siguientePaso === "funcional") {
    opciones.push({
      value: "fotos_funcional",
      label: "Avanzar a funcional",
      tipo: "fotos",
      zona: "funcional",
    });
    return opciones;
  }

  if (siguientePaso === "anamnesis_especifica_zona") {
    const zonas = Array.isArray(resultado?.zonasDetectadas)
      ? resultado.zonasDetectadas
      : [];

    zonas.forEach((zona) => {
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
      opciones.push({
        value: `fotos_${zonaActual}`,
        label: `Continuar zona actual: ${formatearNombreZona(zonaActual)}`,
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
      opciones.push({
        value: `fotos_${zonaActual}`,
        label: `Continuar zona preliminar: ${formatearNombreZona(zonaActual)}`,
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
      opciones.push({
        value: `fotos_${zonaActual}`,
        label: `Continuar zona preliminar: ${formatearNombreZona(zonaActual)}`,
        tipo: "fotos",
        zona: zonaActual,
      });
    }

    opciones.push({
      value: "fotos_funcional",
      label: "Avanzar a funcional",
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
    opciones.push({
      value: "fotos_funcional",
      label: "Avanzar a funcional",
      tipo: "fotos",
      zona: "funcional",
    });

    if (zonaActual) {
      opciones.push({
        value: `fotos_${zonaActual}`,
        label: `Continuar zona actual: ${formatearNombreZona(zonaActual)}`,
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

  if (siguientePaso === "decision_antiguo_funcional_actual_o_cambio") {
    opciones.push({
      value: "fotos_funcional",
      label: "Avanzar a funcional",
      tipo: "fotos",
      zona: "funcional",
    });

    if (zonaActual) {
      opciones.push({
        value: `fotos_${zonaActual}`,
        label: `Continuar diagnóstico actual: ${formatearNombreZona(zonaActual)}`,
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

  if (siguientePaso === "decision_zona_o_funcional") {
    const zonas = Array.isArray(resultado?.zonasDetectadas)
      ? resultado.zonasDetectadas
      : [];

    zonas.forEach((zona) => {
      opciones.push({
        value: `anamnesis_${zona}`,
        label: `Continuar intervención específica: ${formatearNombreZona(zona)}`,
        tipo: "anamnesis_zona",
        zona,
      });
    });

    opciones.push({
      value: "fotos_funcional",
      label: "Avanzar a funcional",
      tipo: "fotos",
      zona: "funcional",
    });

    return opciones;
  }

  return opciones;
}
