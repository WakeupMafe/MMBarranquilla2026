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

/**
 * Obtiene zonas canónicas (sin repetir, en orden) a partir de `patologia_relacionada`
 * de asistencia. Soporta varios separadores (coma, "y", barra, etc.) para múltiples zonas.
 */
export function extraerZonasCanonDesdePatologiaRelacionada(texto) {
  const raw = String(texto ?? "").trim();
  if (!raw) return [];

  const partes = raw
    .split(/\s*(?:,|\/|\||;|\s+y\s+|\s+e\s+|\s+Y\s+|\s+E\s+|\s+&\s+)\s*/iu)
    .map((s) => s.trim())
    .filter(Boolean);

  const candidatos = partes.length > 0 ? partes : [raw];
  const orden = [];
  const seen = new Set();

  for (const p of candidatos) {
    const z = mapearPatologiaRelacionadaAZona(p);
    if (z && !seen.has(z)) {
      seen.add(z);
      orden.push(z);
    }
  }

  return orden;
}
