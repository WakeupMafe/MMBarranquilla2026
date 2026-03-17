import { createBrowserRouter } from "react-router-dom";

import Inicio from "../pages/Inicio";

import ToolsHome from "../features/tools/pages/ToolsHome";
import FotosTestPage from "../features/fotos/pages/FotosTestPage";

import Logros1Start from "../features/logros1/pages/Logros1Start";
import Logros1 from "../features/logros1/pages/Logros1";

import Logros2 from "../features/logros2/pages/Logros2";

import Valoracion from "../features/valoracion/pages/Valoracion";
import AnamnesisGlobal from "../features/valoracion/pages/AnamnesisGlobal";
import AnamnesisZona from "../features/valoracion/pages/AnamnesisZona";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Inicio />,
  },

  {
    path: "/herramientas",
    element: <ToolsHome />,
  },

  // LOGROS 1
  {
    path: "/herramientas/logros-1",
    element: <Logros1Start />,
  },
  {
    path: "/herramientas/logros-1/encuesta",
    element: <Logros1 />,
  },

  // LOGROS 2
  {
    path: "/herramientas/logros-2",
    element: <Logros2 />,
  },

  // PRUEBA FOTOS
  {
    path: "/herramientas/fotos-test",
    element: <FotosTestPage />,
  },

  // VALORACION
  {
    path: "/herramientas/valoracion",
    element: <Valoracion />,
  },

  // ANAMNESIS
  {
    path: "/herramientas/anamnesis-global",
    element: <AnamnesisGlobal />,
  },
  {
    path: "/herramientas/anamnesis-zona",
    element: <AnamnesisZona />,
  },
]);
