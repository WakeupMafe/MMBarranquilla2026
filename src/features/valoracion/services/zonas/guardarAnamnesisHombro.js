import { supabase } from "../../../../shared/lib/supabaseClient";

import {
  HOMBRO_UPLOAD_MODES,
  getHombroUploadMode,
} from "../../../../shared/lib/hombroUploadMode";

export async function guardarAnamnesisHombro({
  numero_documento_fisico,
  profesional_cedula,
  formData,
  resultado,
}) {
  const modo = getHombroUploadMode();

  // 🔹 SIMULACIÓN
  if (modo === HOMBRO_UPLOAD_MODES.SIMULACION) {
    console.log("🧪 [SIMULACIÓN] No se guarda hombro en BD");
    console.log({
      numero_documento_fisico,
      profesional_cedula,
      formData,
      resultado,
    });

    return {
      success: true,
      simulacion: true,
    };
  }

  // 🔹 REAL
  const payload = {
    numero_documento_fisico,
    profesional_cedula,

    // --- datos del form ---
    dolor_semana: formData.dolor_semana ? Number(formData.dolor_semana) : null,
    dolor_para: formData.dolor_para || null,
    limitacion_funcional: formData.limitacion_funcional || null,

    // --- resultado evaluación ---
    clasificacion: resultado?.clasificacion || null,
    requiere_revision_profesional:
      resultado?.requiereRevisionProfesional || false,
    mensaje: resultado?.mensaje || null,
    alertas: resultado?.alertas || [],
    motivos_revision_profesional: resultado?.motivosRevisionProfesional || [],

    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("anamnesis_hombro")
    .upsert(payload, {
      onConflict: "numero_documento_fisico",
    })
    .select();

  if (error) {
    console.error("❌ Error guardando hombro:", error);
    throw error;
  }

  console.log("✅ Hombro guardado correctamente:", data);

  return {
    success: true,
    data,
  };
}
