import { normalizarDocumentoCkin } from "../config/validarCedulaCkin";
import { buscarClasificacionPaciente } from "./buscarClasificacionPaciente";

export async function prepararNavegacionCheckIn({
  paciente,
  profesional,
  checkInPayload,
}) {
  const documento = normalizarDocumentoCkin(checkInPayload?.cedula || "");
  const clasificacionPaciente = await buscarClasificacionPaciente(documento);

  return {
    profesional,
    paciente: {
      ...paciente,
      esPacienteNuevo: Boolean(clasificacionPaciente?.esPacienteNuevo),
      esPacienteAntiguo: Boolean(clasificacionPaciente?.esPacienteAntiguo),
      flujoPaciente: clasificacionPaciente?.flujo || null,
    },
    checkIn: {
      ...checkInPayload,
      esPacienteNuevo: Boolean(clasificacionPaciente?.esPacienteNuevo),
      esPacienteAntiguo: Boolean(clasificacionPaciente?.esPacienteAntiguo),
    },
    clasificacionPaciente,
  };
}
