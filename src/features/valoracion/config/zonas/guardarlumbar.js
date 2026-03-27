import { supabase } from "../../../../shared/lib/supabaseClient";

function limpiarNumero(valor) {
  return String(valor || "")
    .replace(/\D/g, "")
    .trim();
}

function limpiarTexto(valor) {
  const texto = String(valor ?? "").trim();
  return texto === "" ? null : texto;
}

function limpiarNumeroEntero(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

export async function guardarAnamnesisLumbar({ numeroDocumento, formData }) {
  try {
    const documentoNormalizado = limpiarNumero(numeroDocumento);

    if (!documentoNormalizado) {
      throw new Error(
        "No se pudo guardar la anamnesis lumbar: documento inválido.",
      );
    }

    if (!formData || typeof formData !== "object") {
      throw new Error(
        "No se pudo guardar la anamnesis lumbar: formulario inválido.",
      );
    }

    const payload = {
      numero_documento_fisico: documentoNormalizado,

      tiempo_diagnostico: limpiarTexto(formData.tiempo_diagnostico),
      radiografias_dano: limpiarTexto(formData.radiografias_dano),
      tiempo_sintomas: limpiarTexto(formData.tiempo_sintomas),
      debe_parar_por_dolor: limpiarTexto(formData.debe_parar_por_dolor),
      usa_medicamentos: limpiarTexto(formData.usa_medicamentos),
      cirugias_previas_columna: limpiarTexto(formData.cirugias_previas_columna),
      cirugia_antiguedad: limpiarTexto(formData.cirugia_antiguedad),
      pendiente_lista_cirugia: limpiarTexto(formData.pendiente_lista_cirugia),
      dolor_semana: limpiarNumeroEntero(formData.dolor_semana),
      dolor_agudo_irradia_pierna: limpiarTexto(
        formData.dolor_agudo_irradia_pierna,
      ),
      parar_por_dolor_distancia: limpiarTexto(
        formData.parar_por_dolor_distancia,
      ),
      hace_terapia_centro: limpiarTexto(formData.hace_terapia_centro),
      terapia_veces_semana: limpiarTexto(formData.terapia_veces_semana),
      hace_ejercicios_internet: limpiarTexto(formData.hace_ejercicios_internet),
      internet_veces_semana: limpiarTexto(formData.internet_veces_semana),
      razon_no_hace_ejercicio: limpiarTexto(formData.razon_no_hace_ejercicio),
    };

    const { data, error } = await supabase
      .from("anamnesis_lumbar")
      .upsert([payload], {
        onConflict: "numero_documento_fisico",
      })
      .select()
      .single();

    if (error) {
      console.error("Error guardando anamnesis lumbar:", error);

      if (error.code === "23503") {
        throw new Error(
          "No se pudo guardar la anamnesis lumbar porque el paciente no existe en checkin_anamnesis.",
        );
      }

      if (error.code === "42P01") {
        throw new Error(
          "No se pudo guardar la anamnesis lumbar porque la tabla anamnesis_lumbar no existe.",
        );
      }

      throw new Error(
        error.message || "Ocurrió un error al guardar la anamnesis lumbar.",
      );
    }

    return data;
  } catch (error) {
    console.error("Error en guardarAnamnesisLumbar:", error);
    throw error;
  }
}
