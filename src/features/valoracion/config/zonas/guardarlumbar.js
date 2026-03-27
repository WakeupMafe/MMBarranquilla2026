import { supabase } from "../../../../shared/lib/supabaseClient";

function limpiarNumero(valor) {
  return String(valor || "")
    .replace(/\D/g, "")
    .trim();
}

export async function guardarAnamnesisLumbar({ numeroDocumento, formData }) {
  try {
    const documentoNormalizado = limpiarNumero(numeroDocumento);

    if (!documentoNormalizado) {
      throw new Error("Documento inválido");
    }

    const payload = {
      numero_documento_fisico: documentoNormalizado,

      tiempo_diagnostico: formData.tiempo_diagnostico || null,
      radiografias_dano: formData.radiografias_dano || null,
      tiempo_sintomas: formData.tiempo_sintomas || null,
      debe_parar_por_dolor: formData.debe_parar_por_dolor || null,
      usa_medicamentos: formData.usa_medicamentos || null,
      cirugias_previas_columna: formData.cirugias_previas_columna || null,
      cirugia_antiguedad: formData.cirugia_antiguedad || null,
      pendiente_lista_cirugia: formData.pendiente_lista_cirugia || null,
      dolor_semana: formData.dolor_semana
        ? Number(formData.dolor_semana)
        : null,
      dolor_agudo_irradia_pierna: formData.dolor_agudo_irradia_pierna || null,
      parar_por_dolor_distancia: formData.parar_por_dolor_distancia || null,
      hace_terapia_centro: formData.hace_terapia_centro || null,
      terapia_veces_semana: formData.terapia_veces_semana || null,
      hace_ejercicios_internet: formData.hace_ejercicios_internet || null,
      internet_veces_semana: formData.internet_veces_semana || null,
      razon_no_hace_ejercicio: formData.razon_no_hace_ejercicio || null,
    };

    const { data, error } = await supabase
      .from("anamnesis_lumbar")
      .upsert(payload, {
        onConflict: "numero_documento_fisico",
      })
      .select();

    if (error) {
      console.error("Error guardando lumbar:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error en guardarAnamnesisLumbar:", err.message);
    throw err;
  }
}
