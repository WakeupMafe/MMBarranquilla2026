import { useMemo } from "react";
import {
  LIMITACION_MOVERSE,
  ACTIVIDADES_AFECTADAS,
  SINTOMAS,
} from "../data/logros1Catalog";

export default function useLogros1Catalog() {
  // useMemo para que las referencias no cambien en cada render
  return useMemo(() => {
    return {
      limitacionMoverseOptions: LIMITACION_MOVERSE,
      actividadesAfectadasOptions: ACTIVIDADES_AFECTADAS,
      sintomasOptions: SINTOMAS,
    };
  }, []);
}
