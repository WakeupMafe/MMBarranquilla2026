import { buscarClasificacionPaciente } from "./buscarClasificacionPaciente";

export async function prepararNavegacionCheckIn({
  paciente,
  profesional,
  checkInPayload,
}) {
  const clasificacionPaciente = await buscarClasificacionPaciente(
    checkInPayload.cedula,
  );

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
