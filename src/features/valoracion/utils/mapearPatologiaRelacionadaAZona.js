const ZONAS_VALIDAS = new Set([
  "hombro",
  "rodilla",
  "cadera",
  "lumbar",
  "funcional",
]);

/**
 * Convierte texto de encuesta2.patologia_relacionada en clave de zona del flujo.
 * Solo devuelve zona si el texto es reconocible (evita rutas inválidas).
 */
export function mapearPatologiaRelacionadaAZona(texto) {
  const value = String(texto ?? "")
    .trim()
    .toUpperCase();

  if (!value) return null;

  if (value.includes("HOMBRO")) return "hombro";
  if (value.includes("RODILLA")) return "rodilla";
  if (value.includes("CADERA")) return "cadera";
  if (
    value.includes("ESPALDA") ||
    value.includes("LUMBAR") ||
    value.includes("COLUMNA")
  ) {
    return "lumbar";
  }
  if (value.includes("FUNCIONAL")) return "funcional";

  const lower = String(texto ?? "").trim().toLowerCase();
  if (ZONAS_VALIDAS.has(lower)) return lower;

  return null;
}
