import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { alertError } from "../../lib/alerts";
import useProfesionalSession from "../../hooks/useProfesionalSession";

export default function RequireProfesional({ children }) {
  const navigate = useNavigate();
  const { profesional } = useProfesionalSession();

  useEffect(() => {
    if (!profesional) {
      alertError(
        "Acceso restringido",
        "Debes ingresar tu documento para acceder a las herramientas.",
      );
      navigate("/", { replace: true });
    }
  }, [profesional, navigate]);

  if (!profesional) return null;

  return children;
}
