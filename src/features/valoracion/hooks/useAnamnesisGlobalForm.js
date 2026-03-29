import { useState } from "react";
import { anamnesisGlobalInitialState } from "../config/anamnesisGlobalInitialState";

export function useAnamnesisGlobalForm(formularioInicial) {
  const [formData, setFormData] = useState(
    () => formularioInicial ?? anamnesisGlobalInitialState,
  );

  const [errores, setErrores] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrores((prev) => {
      if (!prev[name]) return prev;

      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function resetForm() {
    setFormData(anamnesisGlobalInitialState);
    setErrores({});
  }

  return {
    formData,
    errores,
    setErrores,
    handleChange,
    resetForm,
  };
}
