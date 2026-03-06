export function buildLogros1Payload({ paciente, profesional, form }) {
  const sintomasSinOtro = (form.sintomas_top || [])
    .filter((s) => s !== "otro")
    .slice(0, 3);

  const sintoma_1 = sintomasSinOtro[0] || null;
  const sintoma_2 = sintomasSinOtro[1] || null;
  const sintoma_3 = sintomasSinOtro[2] || null;

  const objetivo_1 = sintoma_1 ? form.objetivos?.[sintoma_1] || null : null;
  const objetivo_2 = sintoma_2 ? form.objetivos?.[sintoma_2] || null : null;
  const objetivo_3 = sintoma_3 ? form.objetivos?.[sintoma_3] || null : null;

  return {
    cedula: Number(paciente.numero_documento_fisico),
    nombre_completo: String(paciente.nombre_apellido_documento || "").trim(),

    limitacion_moverse: form.limitacion_moverse,
    actividades_afectadas: JSON.stringify(form.actividades_afectadas || []),

    sintoma_1,
    sintoma_2,
    sintoma_3,
    otro_sintoma: (form.sintomas_top || []).includes("otro")
      ? String(form.otro_sintoma || "").trim()
      : null,

    objetivo_1,
    objetivo_2,
    objetivo_3,

    objetivo_extra: form.objetivo_extra?.trim() || null,
    adicional_no_puede: form.adicional_no_puede?.trim() || null,

    encuestador: Number(profesional.cedula),
  };
}
