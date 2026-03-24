import { supabase } from "../../../shared/lib/supabaseClient";

export async function guardarAnamnesisGlobal(payload) {
  const numeroDocumento = String(payload?.numero_documento_fisico || "").trim();

  if (!numeroDocumento) {
    throw new Error("La cédula del paciente es obligatoria.");
  }

  const { data, error } = await supabase
    .from("anamnesis_global")
    .upsert(payload, {
      onConflict: "numero_documento_fisico",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
