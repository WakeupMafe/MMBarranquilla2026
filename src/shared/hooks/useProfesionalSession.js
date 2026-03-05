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

  // Si llega desde Inicio (navigate state), lo guardamos en sesión
  useEffect(() => {
    const fromState = location.state?.profesional;
    if (fromState) setProfesional(fromState);
  }, [location.state, setProfesional]);

  return { profesional, setProfesional, clearProfesional: remove };
}
