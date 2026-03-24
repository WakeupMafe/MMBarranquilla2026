import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useSessionStorageState from "./useSessionStorageState";

const SESSION_KEY = "wk_profesional";

export default function useProfesionalSession() {
  const location = useLocation();

  const {
    value: profesional,
    setValue: setProfesional,
    remove,
  } = useSessionStorageState(SESSION_KEY, null);

  useEffect(() => {
    const fromState = location.state?.profesional;

    // Si el profesional llega por navegación desde otra página,
    // lo guardamos en sessionStorage para reutilizarlo en todo el módulo.
    if (fromState) {
      setProfesional(fromState);
    }
  }, [location.state, setProfesional]);

  return {
    profesional,
    setProfesional,
    clearProfesional: remove,
  };
}
