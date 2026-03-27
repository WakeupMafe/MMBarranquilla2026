import { supabase } from "../../../shared/lib/supabaseClient";

export async function guardarAnamnesisGlobal(payload) {
  const numeroDocumento = String(payload?.numero_documento_fisico || "").trim();

  if (!numeroDocumento) {
    throw new Error("La cédula del paciente es obligatoria.");
  }

  const payloadLimpio = {
    ...payload,
    numero_documento_fisico: numeroDocumento,
  };

  const { data, error } = await supabase
    .from("anamnesis_global")
    .upsert(payloadLimpio, {
      onConflict: "numero_documento_fisico",
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      error.message || "No fue posible guardar la anamnesis global.",
    );
  }

  return data;
}
