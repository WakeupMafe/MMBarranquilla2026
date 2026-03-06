import { useMemo, useState } from "react";

const initialForm = {
  limitacion_moverse: "",
  actividades_afectadas: [],
  sintomas_top: [],
  otro_sintoma: "",
  objetivos: {},
  objetivo_extra: "",
  adicional_no_puede: "",
};

export default function useLogros1Form() {
  const [form, setForm] = useState(initialForm);

  const toggleActividad = (value) => {
    setForm((prev) => {
      const exists = prev.actividades_afectadas.includes(value);
      const next = exists
        ? prev.actividades_afectadas.filter((x) => x !== value)
        : [...prev.actividades_afectadas, value];
      return { ...prev, actividades_afectadas: next };
    });
  };

  const toggleSintoma = (value) => {
    setForm((prev) => {
      const exists = prev.sintomas_top.includes(value);

      if (exists) {
        const nextSintomas = prev.sintomas_top.filter((x) => x !== value);
        const nextObjetivos = { ...prev.objetivos };
        delete nextObjetivos[value];

        return {
          ...prev,
          sintomas_top: nextSintomas,
          objetivos: nextObjetivos,
          otro_sintoma: value === "otro" ? "" : prev.otro_sintoma,
        };
      }

      if (prev.sintomas_top.length >= 3) return prev;

      return { ...prev, sintomas_top: [...prev.sintomas_top, value] };
    });
  };

  const objetivosAResponder = useMemo(
    () => form.sintomas_top.filter((s) => s !== "otro"),
    [form.sintomas_top],
  );

  const setObjetivo = (sintomaValue, objetivoValue) => {
    setForm((prev) => ({
      ...prev,
      objetivos: { ...prev.objetivos, [sintomaValue]: objetivoValue },
    }));
  };

  const reset = () => setForm(initialForm);

  return {
    form,
    setForm,
    toggleActividad,
    toggleSintoma,
    setObjetivo,
    objetivosAResponder,
    reset,
  };
}
