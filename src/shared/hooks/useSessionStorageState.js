import { useEffect, useMemo, useState } from "react";

/**
 * Estado persistido en sessionStorage (durante la sesión del navegador).
 * - Guarda y lee JSON
 * - Evita crash si el JSON está dañado
 */
export default function useSessionStorageState(key, initialValue) {
  const initial = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [value, setValue] = useState(initial);

  useEffect(() => {
    try {
      if (value === undefined || value === null) {
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // Si sessionStorage falla, no rompemos la app
    }
  }, [key, value]);

  const remove = () => {
    try {
      sessionStorage.removeItem(key);
    } catch {}
    setValue(null);
  };

  return { value, setValue, remove };
}
