import { supabase } from "../../../shared/lib/supabaseClient";

export async function saveLogros1(payload) {
  const { error } = await supabase.from("logros_fase1").insert([payload]);
  if (error)
    throw new Error(error.message || "Error insertando en logros_fase1");
}

export async function incrementProfesionalEncuestas(cedulaProfesional) {
  // best-effort
  const { data, error } = await supabase
    .from("profesionales")
    .select("encuestas_realizadas")
    .eq("cedula", Number(cedulaProfesional))
    .maybeSingle();

  if (error || !data) return;

  const actual = Number(data.encuestas_realizadas || 0);

  await supabase
    .from("profesionales")
    .update({ encuestas_realizadas: actual + 1 })
    .eq("cedula", Number(cedulaProfesional));
}
