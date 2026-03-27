import { supabase } from "../../../../shared/lib/supabaseClient";

import {
  RODILLA_UPLOAD_MODES,
  getRodillaUploadMode,
} from "../../../../shared/lib/rodillaUploadMode";

function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export async function guardarAnamnesisRodilla({
  numero_documento_fisico,
  profesional_cedula,
  formData,
  resultado,
}) {
  const modo = getRodillaUploadMode();

  // 🔹 SIMULACIÓN
  if (modo === RODILLA_UPLOAD_MODES.SIMULACION) {
    console.log("🧪 [SIMULACIÓN] No se guarda rodilla en BD");
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

  const payload = {
    numero_documento_fisico,
    profesional_cedula,
    zona: "rodilla",

    // =========================
    // 1. DOLOR EN RODILLA
    // =========================
    dolor_lado: formData.dolor_lado || null,
    dolor_localizacion: formData.dolor_localizacion || null,
    intensidad_dolor_actual: toNumberOrNull(formData.intensidad_dolor_actual),
    horas_dolor_dia: toNumberOrNull(formData.horas_dolor_dia),
    momento_dolor: formData.momento_dolor || null,
    mejora_con: Array.isArray(formData.mejora_con) ? formData.mejora_con : [],
    mejora_con_otro: formData.mejora_con_otro || null,
    dolor_inicial_mejora: toNumberOrNull(formData.dolor_inicial_mejora),
    dolor_final_mejora: toNumberOrNull(formData.dolor_final_mejora),
    trastorna_descanso: formData.trastorna_descanso || null,
    crepito_ruido: formData.crepito_ruido || null,
    al_caminar_sintoma: formData.al_caminar_sintoma || null,
    dolor_otro_segmento: formData.dolor_otro_segmento || null,

    // =========================
    // 2. ARTROSIS
    // =========================
    tiene_artrosis_diagnostico: formData.tiene_artrosis_diagnostico || null,
    artrosis_lado: formData.artrosis_lado || null,
    tiempo_diagnostico_valor: toNumberOrNull(formData.tiempo_diagnostico_valor),
    tiempo_diagnostico_unidad: formData.tiempo_diagnostico_unidad || null,
    tiene_radiografia_artrosis: formData.tiene_radiografia_artrosis || null,
    sintomas_mayor_6_meses: formData.sintomas_mayor_6_meses || null,
    problemas_caminar: formData.problemas_caminar || null,
    tratamiento_artrosis: formData.tratamiento_artrosis || null,
    cirugia_artrosis_tiempo: formData.cirugia_artrosis_tiempo || null,
    dolor_ultima_semana: toNumberOrNull(formData.dolor_ultima_semana),
    parar_por_dolor_distancia: formData.parar_por_dolor_distancia || null,
    limita_descanso: formData.limita_descanso || null,
    artrosis_mejora_con: formData.artrosis_mejora_con || null,
    artrosis_mejora_con_otro: formData.artrosis_mejora_con_otro || null,
    artrosis_dolor_inicial: toNumberOrNull(formData.artrosis_dolor_inicial),
    artrosis_dolor_final: toNumberOrNull(formData.artrosis_dolor_final),

    // =========================
    // 3. MARCHA / SÍNTOMAS ASOCIADOS
    // =========================
    derrame_al_caminar: formData.derrame_al_caminar || null,
    dolor_al_caminar: toNumberOrNull(formData.dolor_al_caminar),
    cojera_por_rodilla: formData.cojera_por_rodilla || null,
    usa_baston: formData.usa_baston || null,
    bloqueos: formData.bloqueos || null,
    fallas: formData.fallas || null,

    // =========================
    // 4. EJERCICIO / TERAPIA
    // =========================
    hace_ejercicios: formData.hace_ejercicios || null,
    tipo_ejercicio: formData.tipo_ejercicio || null,
    veces_ejercicio_semana: toNumberOrNull(formData.veces_ejercicio_semana),
    razon_menos_3_semana: formData.razon_menos_3_semana || null,
    hace_cardio: formData.hace_cardio || null,
    tipo_cardio: formData.tipo_cardio || null,
    tipo_cardio_otro: formData.tipo_cardio_otro || null,
    veces_cardio_semana: toNumberOrNull(formData.veces_cardio_semana),

    // =========================
    // 5. ESTADO CLÍNICO ADICIONAL
    // =========================
    derrame_general: formData.derrame_general || null,
    diagnostico_confirmado: formData.diagnostico_confirmado || null,
    pendiente_examen: formData.pendiente_examen || null,
    en_tratamiento: formData.en_tratamiento || null,
    espera_cita_manejo: formData.espera_cita_manejo || null,
    espera_cirugia: formData.espera_cirugia || null,

    // =========================
    // RESULTADO DE EVALUACIÓN
    // =========================
    requiere_revision_profesional:
      resultado?.requiereRevisionProfesional || false,
    clasificacion: resultado?.clasificacion || null,
    mensaje: resultado?.mensaje || null,
    alertas: Array.isArray(resultado?.alertas) ? resultado.alertas : [],
    motivos_revision_profesional: Array.isArray(
      resultado?.motivosRevisionProfesional,
    )
      ? resultado.motivosRevisionProfesional
      : [],
    resumen: resultado?.resumen || null,
  };

  const { data, error } = await supabase
    .from("anamnesis_rodilla")
    .upsert(payload, {
      onConflict: "numero_documento_fisico",
    })
    .select();

  if (error) {
    console.error("❌ Error guardando rodilla:", error);
    throw error;
  }

  console.log("✅ Rodilla guardada correctamente:", data);

  return {
    success: true,
    data,
  };
}
