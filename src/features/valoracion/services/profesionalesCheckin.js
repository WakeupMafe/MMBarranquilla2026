import { supabase } from "../../../shared/lib/supabaseClient";

function limpiarTexto(valor) {
  return String(valor || "").trim();
}

function construirNombre(nombre, apellido) {
  return [nombre, apellido]
    .map((v) => limpiarTexto(v))
    .filter(Boolean)
    .join(" ");
}

export async function obtenerProfesionalesCheckin() {
  const { data, error } = await supabase
    .from("profesionales")
    .select("cedula, nombre, apellido")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error cargando profesionales:", error);
    throw error;
  }

  return (data || []).map((profesional) => {
    const cedula = limpiarTexto(profesional.cedula);
    const nombre = limpiarTexto(profesional.nombre);
    const apellido = limpiarTexto(profesional.apellido);
    const nombreCompleto = construirNombre(nombre, apellido);

    return {
      cedula,
      nombre,
      apellido,
      label: `${nombreCompleto} - ${cedula}`,
    };
  });
}
