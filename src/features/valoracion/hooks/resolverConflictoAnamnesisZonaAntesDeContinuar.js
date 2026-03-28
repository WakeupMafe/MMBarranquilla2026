import { supabase } from "../../../shared/lib/supabaseClient";
import {
  alertConfirm,
  alertError,
  alertSelect,
} from "../../../shared/lib/alerts";

const TABLAS_ANAMNESIS_POR_ZONA = {
  hombro: "anamnesis_hombro",
  cadera: "anamnesis_cadera",
  rodilla: "anamnesis_rodilla",
  lumbar: "anamnesis_lumbar",
  espalda: "anamnesis_lumbar",
  lumbalgia: "anamnesis_lumbar",
};

const COLUMNA_DOCUMENTO = "numero_documento_fisico";

function normalizarDocumento(valor) {
  return String(valor ?? "").trim();
}

function normalizarZona(valor) {
  return String(valor ?? "")
    .trim()
    .toLowerCase();
}

function capitalizarZona(valor) {
  const zona = normalizarZona(valor);

  if (!zona) return "zona seleccionada";
  if (zona === "lumbar" || zona === "espalda" || zona === "lumbalgia") {
    return "lumbar";
  }
  if (zona === "funcional") {
    return "funcional";
  }

  return zona.charAt(0).toUpperCase() + zona.slice(1);
}

function obtenerTablaPorZona(zona) {
  return TABLAS_ANAMNESIS_POR_ZONA[normalizarZona(zona)] || null;
}

async function existeRegistroEnZona({ tabla, numeroDocumento }) {
  const { data, error } = await supabase
    .from(tabla)
    .select(COLUMNA_DOCUMENTO)
    .eq(COLUMNA_DOCUMENTO, numeroDocumento)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

async function eliminarRegistroZona({ tabla, numeroDocumento }) {
  const { error } = await supabase
    .from(tabla)
    .delete()
    .eq(COLUMNA_DOCUMENTO, numeroDocumento);

  if (error) {
    throw error;
  }
}

async function buscarAnamnesisExistentesPorZona(numeroDocumento) {
  const cedula = normalizarDocumento(numeroDocumento);
  const zonasBase = ["hombro", "cadera", "rodilla", "lumbar"];
  const existentes = [];

  for (const zona of zonasBase) {
    const tabla = obtenerTablaPorZona(zona);

    if (!tabla) {
      continue;
    }

    const existe = await existeRegistroEnZona({
      tabla,
      numeroDocumento: cedula,
    });

    if (existe) {
      existentes.push({
        zona,
        tabla,
      });
    }
  }

  return existentes;
}

/**
 * Resuelve conflictos antes de navegar a una nueva anamnesis de zona
 * o antes de enviar al protocolo funcional/fotos.
 *
 * Casos:
 * 1. Misma zona ya existente:
 *    - rehacer
 *    - continuar con la existente
 *    - cancelar
 *
 * 2. Existen otras zonas distintas:
 *    - eliminar las previas y continuar con la nueva
 *    - cancelar
 *
 * 3. Zona funcional:
 *    - si existen anamnesis previas, eliminarlas antes de enviar a fotos
 *    - si no existen, continuar normal
 *
 * 4. No existe ninguna anamnesis de zona:
 *    - continúa normal
 */
export async function resolverConflictoAnamnesisZonaAntesDeContinuar({
  numeroDocumento,
  zonaNueva,
}) {
  const cedula = normalizarDocumento(numeroDocumento);
  const zonaObjetivo = normalizarZona(zonaNueva);

  if (!cedula) {
    await alertError(
      "Paciente no identificado",
      "No fue posible identificar la cédula del paciente para validar conflictos de anamnesis de zona.",
    );

    return {
      puedeContinuar: false,
      accion: "cancelar",
      zonaNueva: null,
      registrosExistentes: [],
      eliminadas: [],
    };
  }

  if (!zonaObjetivo) {
    await alertError(
      "Zona no definida",
      "No fue posible identificar la zona seleccionada para continuar.",
    );

    return {
      puedeContinuar: false,
      accion: "cancelar",
      zonaNueva: null,
      registrosExistentes: [],
      eliminadas: [],
    };
  }

  let registrosExistentes = [];

  try {
    registrosExistentes = await buscarAnamnesisExistentesPorZona(cedula);
  } catch (error) {
    console.error("Error buscando anamnesis de zona existentes:", error);

    await alertError(
      "Error validando anamnesis de zona",
      error?.message ||
        "No fue posible verificar si el paciente ya tiene anamnesis de zona registradas.",
    );

    return {
      puedeContinuar: false,
      accion: "cancelar",
      zonaNueva: zonaObjetivo,
      registrosExistentes: [],
      eliminadas: [],
    };
  }

  // CASO FUNCIONAL
  if (zonaObjetivo === "funcional") {
    if (!registrosExistentes.length) {
      return {
        puedeContinuar: true,
        accion: "sin_conflicto_funcional",
        zonaNueva: zonaObjetivo,
        registrosExistentes: [],
        eliminadas: [],
      };
    }

    const descripcionZonas = registrosExistentes
      .map((registro) => capitalizarZona(registro.zona))
      .join(", ");

    const confirmarFuncional = await alertConfirm({
      title: "Anamnesis previas detectadas",
      text: `El paciente tiene anamnesis previas de ${descripcionZonas}. Para enviarlo al protocolo de fotos de la zona funcional, estas anamnesis serán eliminadas. ¿Deseas continuar?`,
      confirmText: "Sí, eliminar y continuar",
      cancelText: "Cancelar",
    });

    if (!confirmarFuncional) {
      return {
        puedeContinuar: false,
        accion: "cancelar",
        zonaNueva: zonaObjetivo,
        registrosExistentes,
        eliminadas: [],
      };
    }

    const eliminadas = [];

    try {
      for (const registro of registrosExistentes) {
        await eliminarRegistroZona({
          tabla: registro.tabla,
          numeroDocumento: cedula,
        });

        eliminadas.push(registro.zona);
      }

      return {
        puedeContinuar: true,
        accion: "eliminar_previas_y_continuar_funcional",
        zonaNueva: zonaObjetivo,
        registrosExistentes,
        eliminadas,
      };
    } catch (error) {
      console.error(
        "Error eliminando anamnesis previas antes de funcional:",
        error,
      );

      await alertError(
        "Error eliminando anamnesis previas",
        error?.message ||
          "No fue posible eliminar las anamnesis previas antes de continuar al protocolo funcional.",
      );

      return {
        puedeContinuar: false,
        accion: "cancelar",
        zonaNueva: zonaObjetivo,
        registrosExistentes,
        eliminadas,
      };
    }
  }

  const tablaZonaNueva = obtenerTablaPorZona(zonaObjetivo);

  if (!tablaZonaNueva) {
    await alertError(
      "Zona no configurada",
      `No existe una tabla configurada para la zona ${capitalizarZona(
        zonaObjetivo,
      )}.`,
    );

    return {
      puedeContinuar: false,
      accion: "cancelar",
      zonaNueva: zonaObjetivo,
      registrosExistentes: [],
      eliminadas: [],
    };
  }

  // 🔹 si no hay registros previos, deja seguir sin mostrar nada
  if (!registrosExistentes.length) {
    return {
      puedeContinuar: true,
      accion: "sin_conflicto",
      zonaNueva: zonaObjetivo,
      registrosExistentes: [],
      eliminadas: [],
    };
  }

  const registroMismaZona =
    registrosExistentes.find(
      (registro) => normalizarZona(registro.zona) === zonaObjetivo,
    ) || null;

  const registrosOtrasZonas = registrosExistentes.filter(
    (registro) => normalizarZona(registro.zona) !== zonaObjetivo,
  );

  // CASO 1: existe la misma zona
  if (registroMismaZona) {
    const seleccion = await alertSelect({
      title: "Anamnesis de zona existente",
      text: `El paciente ya tiene una anamnesis de ${capitalizarZona(
        zonaObjetivo,
      )}. Selecciona cómo deseas continuar.`,
      inputOptions: {
        rehacer: `Eliminar la anamnesis previa de ${capitalizarZona(
          zonaObjetivo,
        )} y volver a realizarla`,
        continuar_existente: `Continuar con la anamnesis existente de ${capitalizarZona(
          zonaObjetivo,
        )}`,
      },
      inputPlaceholder: "Selecciona una opción",
      confirmButtonText: "Continuar",
      cancelButtonText: "Cancelar",
    });

    if (!seleccion) {
      return {
        puedeContinuar: false,
        accion: "cancelar",
        zonaNueva: zonaObjetivo,
        registrosExistentes,
        eliminadas: [],
      };
    }

    if (seleccion === "continuar_existente") {
      return {
        puedeContinuar: true,
        accion: "continuar_existente",
        zonaNueva: zonaObjetivo,
        registrosExistentes,
        eliminadas: [],
      };
    }

    if (seleccion === "rehacer") {
      try {
        await eliminarRegistroZona({
          tabla: registroMismaZona.tabla,
          numeroDocumento: cedula,
        });

        return {
          puedeContinuar: true,
          accion: "rehacer_misma_zona",
          zonaNueva: zonaObjetivo,
          registrosExistentes,
          eliminadas: [zonaObjetivo],
        };
      } catch (error) {
        console.error("Error eliminando anamnesis de misma zona:", error);

        await alertError(
          "Error eliminando anamnesis existente",
          error?.message ||
            "No fue posible eliminar la anamnesis de zona existente para rehacerla.",
        );

        return {
          puedeContinuar: false,
          accion: "cancelar",
          zonaNueva: zonaObjetivo,
          registrosExistentes,
          eliminadas: [],
        };
      }
    }
  }

  // CASO 2: existen otras zonas distintas a la nueva
  if (registrosOtrasZonas.length) {
    const descripcionZonas = registrosOtrasZonas
      .map((registro) => capitalizarZona(registro.zona))
      .join(", ");

    const confirmar = await alertConfirm({
      title: "Conflicto con anamnesis previas",
      text: `El paciente tiene anamnesis previas de ${descripcionZonas}, pero la nueva ruta corresponde a ${capitalizarZona(
        zonaObjetivo,
      )}. Para continuar, se eliminarán esas anamnesis previas. ¿Deseas seguir?`,
      confirmText: "Sí, eliminar y continuar",
      cancelText: "Cancelar",
    });

    if (!confirmar) {
      return {
        puedeContinuar: false,
        accion: "cancelar",
        zonaNueva: zonaObjetivo,
        registrosExistentes,
        eliminadas: [],
      };
    }

    const eliminadas = [];

    try {
      for (const registro of registrosOtrasZonas) {
        await eliminarRegistroZona({
          tabla: registro.tabla,
          numeroDocumento: cedula,
        });

        eliminadas.push(registro.zona);
      }

      return {
        puedeContinuar: true,
        accion: "eliminar_otras_y_continuar",
        zonaNueva: zonaObjetivo,
        registrosExistentes,
        eliminadas,
      };
    } catch (error) {
      console.error("Error eliminando anamnesis de otras zonas:", error);

      await alertError(
        "Error eliminando anamnesis previas",
        error?.message ||
          "No fue posible eliminar una o más anamnesis previas antes de continuar.",
      );

      return {
        puedeContinuar: false,
        accion: "cancelar",
        zonaNueva: zonaObjetivo,
        registrosExistentes,
        eliminadas,
      };
    }
  }

  return {
    puedeContinuar: true,
    accion: "sin_conflicto",
    zonaNueva: zonaObjetivo,
    registrosExistentes,
    eliminadas: [],
  };
}
