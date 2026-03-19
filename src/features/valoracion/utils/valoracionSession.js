const STORAGE_KEY = "valoracion_activa";

export function iniciarValoracionActiva(paciente) {
  if (!paciente?.numero_documento_fisico) return;

  const clasificacion = paciente?.clasificacionPaciente || {};

  const session = {
    activa: true,
    enviada: false,
    startedAt: new Date().toISOString(),

    paciente: {
      numero_documento_fisico: paciente.numero_documento_fisico,
      nombre_apellido_documento: paciente.nombre_apellido_documento,
      genero: paciente.genero ?? "",
    },

    // 🔥 NUEVO: guardar TODA la lógica de flujo
    clasificacionPaciente: {
      flujo: clasificacion.flujo,
      esPacienteNuevo: clasificacion.esPacienteNuevo,
      esPacienteAntiguo: clasificacion.esPacienteAntiguo,

      ocultarDeteccionDolor: clasificacion.ocultarDeteccionDolor,
      mostrarOpcionZonaFuncional: clasificacion.mostrarOpcionZonaFuncional,
      mostrarOpcionPrincipalFuncional:
        clasificacion.mostrarOpcionPrincipalFuncional,

      zonaDestino: clasificacion.zonaDestino,
      zonaPrincipal: clasificacion.zonaPrincipal,
      zonaSecundaria: clasificacion.zonaSecundaria,

      mensajeFlujoGlobal: clasificacion.mensajeFlujoGlobal,
    },
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function obtenerValoracionActiva() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (!parsed?.activa || parsed?.enviada) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function limpiarValoracionActiva() {
  localStorage.removeItem(STORAGE_KEY);
}
