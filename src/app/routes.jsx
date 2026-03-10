import { createBrowserRouter } from "react-router-dom";

import Inicio from "../pages/Inicio";

import ToolsHome from "../features/tools/pages/ToolsHome";

import Logros1Start from "../features/logros1/pages/Logros1Start";
import Logros1 from "../features/logros1/pages/Logros1";

import Logros2 from "../features/logros2/pages/Logros2";
import Valoracion from "../features/valoracion/pages/Valoracion";

import FotoUploadTest from "../features/fotos/pages/FotoUploadTest";

export const router = createBrowserRouter([
  { path: "/", element: <Inicio /> },

  { path: "/herramientas", element: <ToolsHome /> },

  // LOGROS 1
  { path: "/herramientas/logros-1", element: <Logros1Start /> },
  { path: "/herramientas/logros-1/encuesta", element: <Logros1 /> },

  // PRUEBA FOTOS
  { path: "/herramientas/fotos-test", element: <FotoUploadTest /> },

  // OTROS
  { path: "/herramientas/logros-2", element: <Logros2 /> },
  { path: "/herramientas/valoracion", element: <Valoracion /> },
]);
