import { useEffect, useState } from "react";
import { anamnesisGlobalInitialState } from "../config/anamnesisGlobalInitialState";
import {
  guardarAnamnesisGlobalDraft,
  obtenerAnamnesisGlobalDraft,
} from "../utils/anamnesisGlobalDraft";

export function useAnamnesisGlobalForm() {
  const [formData, setFormData] = useState(() => {
    return obtenerAnamnesisGlobalDraft() || anamnesisGlobalInitialState;
  });

  const [errores, setErrores] = useState({});

  useEffect(() => {
    guardarAnamnesisGlobalDraft(formData);
  }, [formData]);

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

  return {
    formData,
    errores,
    setErrores,
    handleChange,
  };
}
