import { formatearNombreZona } from "../utils/construirOpcionesContinuidad";

/**
 * Texto persistido en `anamnesis_global.mensaje_resultado` tras completar la anamnesis global.
 * Ej.: "Paciente Antiguo; Ruta Seleccionada: Global, Cadera (fotos)"
 */
export function construirMensajeResultadoAnamnesisGlobal({
  clasificacionPaciente,
  opcion,
  zonasMultiAnamnesis,
}) {
  const tipoPaciente =
    clasificacionPaciente?.esPacienteNuevo === true
      ? "Paciente Nuevo"
      : "Paciente Antiguo";

  let detalleZona = "";

  if (Array.isArray(zonasMultiAnamnesis) && zonasMultiAnamnesis.length > 0) {
    detalleZona = zonasMultiAnamnesis
      .filter(Boolean)
      .map((z) => formatearNombreZona(z))
      .join(", ");
    detalleZona = detalleZona
      ? `${detalleZona} (anamnesis zona)`
      : "anamnesis zona";
  } else if (opcion?.zona != null && opcion.zona !== "") {
    const nombre = formatearNombreZona(opcion.zona);
    if (opcion.tipo === "fotos") {
      detalleZona = `${nombre} (fotos)`;
    } else {
      detalleZona = `${nombre} (anamnesis zona)`;
    }
  } else {
    detalleZona = "—";
  }

  return `${tipoPaciente}; Ruta Seleccionada: Global, ${detalleZona}`;
}
