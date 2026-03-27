import { VIDEO_SLOTS } from "./videoSlots";

// Aquí agrupamos los videos por protocolo/zona.
// Esto será lo que después leerá VideoUploadTest.jsx
// para decidir qué grupos mostrar según la zona seleccionada.

export const VIDEO_GROUPS = [
  {
    id: "rodilla_videos_marcha",
    title: "Videos de marcha - Rodilla",
    description: "Captura los videos funcionales requeridos para rodilla.",
    zonas: ["rodilla"],
    items: [
      VIDEO_SLOTS.rodilla_marcha_frente,
      VIDEO_SLOTS.rodilla_marcha_espaldas,
    ],
  },

  {
    id: "lumbar_videos_marcha",
    title: "Videos de marcha - Lumbar",
    description: "Captura los videos funcionales requeridos para lumbar.",
    zonas: ["lumbar"],
    items: [
      VIDEO_SLOTS.lumbar_marcha_frente,
      VIDEO_SLOTS.lumbar_marcha_espaldas,
    ],
  },

  {
    id: "cadera_videos_marcha",
    title: "Videos de marcha - Cadera",
    description: "Captura los videos funcionales requeridos para cadera.",
    zonas: ["cadera"],
    items: [
      VIDEO_SLOTS.cadera_marcha_frente,
      VIDEO_SLOTS.cadera_marcha_espaldas,
    ],
  },
  {
    id: "funcional_videos_marcha",
    title: "Videos funcionales",
    description: "Captura los videos básicos de marcha.",
    zonas: ["funcional"],
    items: [
      VIDEO_SLOTS.rodilla_marcha_frente,
      VIDEO_SLOTS.rodilla_marcha_espaldas,
    ],
  },
];
