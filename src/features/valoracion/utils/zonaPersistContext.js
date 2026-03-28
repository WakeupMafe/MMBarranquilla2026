export const PROFESIONAL_SESSION_KEY = "wk_profesional";

export function normalizarDocumentoDigitos(valor) {
  return String(valor ?? "")
    .replace(/\D/g, "")
    .trim();
}

/**
 * Documento del paciente: props del padre + location.state + valoración activa (localStorage).
 */
export function resolverDocumentoPacienteDesdeCache({
  propDocumento,
  locationState,
  valoracionActiva,
}) {
  const candidates = [
    propDocumento,
    locationState?.cedula,
    locationState?.paciente?.numero_documento_fisico,
    locationState?.paciente?.num_documento,
    locationState?.paciente?.cedula,
    valoracionActiva?.paciente?.numero_documento_fisico,
    valoracionActiva?.paciente?.num_documento,
    valoracionActiva?.paciente?.cedula,
  ];

  for (const c of candidates) {
    const n = normalizarDocumentoDigitos(c);
    if (n) return n;
  }
  return "";
}

/**
 * Cédula del profesional: prop + state de ruta + sessionStorage (misma clave que anamnesis global).
 */
export function resolverProfesionalCedulaDesdeCache({
  propCedula,
  locationState,
}) {
  const trimmed = String(propCedula ?? "").trim();
  if (trimmed) return trimmed;

  const fromState = locationState?.profesional?.cedula;
  if (fromState) return String(fromState).trim();

  try {
    const raw = sessionStorage.getItem(PROFESIONAL_SESSION_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.cedula) return String(p.cedula).trim();
    }
  } catch {
    /* ignore */
  }

  return "";
}

export function resolverProfesionalObjetoDesdeCache({ locationState }) {
  if (locationState?.profesional) return locationState.profesional;

  try {
    const raw = sessionStorage.getItem(PROFESIONAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
