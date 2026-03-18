import RodillaForm from "../components/zonas/RodillaForm";
import CaderaForm from "../components/zonas/CaderaForm";
import LumbarForm from "../components/zonas/LumbarForm";
import HombroForm from "../components/zonas/HombroForm";

export const zonasConfig = {
  rodilla: {
    label: "Rodilla",
    component: RodillaForm,
  },
  cadera: {
    label: "Cadera",
    component: CaderaForm,
  },
  lumbar: {
    label: "Lumbar",
    component: LumbarForm,
  },
  hombro: {
    label: "Hombro",
    component: HombroForm,
  },
};
