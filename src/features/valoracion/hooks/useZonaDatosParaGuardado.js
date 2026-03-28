import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { obtenerValoracionActiva } from "../utils/valoracionSession";
import {
  resolverDocumentoPacienteDesdeCache,
  resolverProfesionalCedulaDesdeCache,
} from "../utils/zonaPersistContext";

/**
 * Datos mínimos para upsert en tablas de zona: siempre combina props con caché (router + valoracion_activa + wk_profesional).
 */
export function useZonaDatosParaGuardado({
  numeroDocumento,
  numero_documento_fisico,
  profesionalCedula,
  profesional_cedula,
} = {}) {
  const location = useLocation();

  return useMemo(() => {
    const valoracionActiva = obtenerValoracionActiva();
    const propDoc =
      numeroDocumento ??
      numero_documento_fisico ??
      "";
    const propProf = profesionalCedula ?? profesional_cedula ?? "";

    const documentoPaciente = resolverDocumentoPacienteDesdeCache({
      propDocumento: propDoc,
      locationState: location.state,
      valoracionActiva,
    });

    const profesionalCedulaResuelta = resolverProfesionalCedulaDesdeCache({
      propCedula: propProf,
      locationState: location.state,
    });

    return {
      documentoPaciente,
      profesionalCedula: profesionalCedulaResuelta,
    };
  }, [
    numeroDocumento,
    numero_documento_fisico,
    profesionalCedula,
    profesional_cedula,
    location.state,
  ]);
}
