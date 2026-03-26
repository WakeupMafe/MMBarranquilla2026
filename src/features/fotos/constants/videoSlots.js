// Cada objeto representa un video individual que se debe capturar.
// Aquí solo definimos la información base de cada video.

export const VIDEO_SLOTS = {
  rodilla_marcha_frente: {
    id: "rodilla_marcha_frente",
    title: "Marcha de frente",
    description: "Graba al paciente caminando de frente hacia la cámara.",
    tipoVideo: "marcha_frente",
    zona: "rodilla",
    duracionMaxima: 15,
  },

  rodilla_marcha_espaldas: {
    id: "rodilla_marcha_espaldas",
    title: "Marcha de espaldas",
    description: "Graba al paciente caminando de espaldas a la cámara.",
    tipoVideo: "marcha_espaldas",
    zona: "rodilla",
    duracionMaxima: 15,
  },

  lumbar_marcha_frente: {
    id: "lumbar_marcha_frente",
    title: "Marcha de frente",
    description: "Graba al paciente caminando de frente hacia la cámara.",
    tipoVideo: "marcha_frente",
    zona: "lumbar",
    duracionMaxima: 15,
  },

  lumbar_marcha_espaldas: {
    id: "lumbar_marcha_espaldas",
    title: "Marcha de espaldas",
    description: "Graba al paciente caminando de espaldas a la cámara.",
    tipoVideo: "marcha_espaldas",
    zona: "lumbar",
    duracionMaxima: 15,
  },

  cadera_marcha_frente: {
    id: "cadera_marcha_frente",
    title: "Marcha de frente",
    description: "Graba al paciente caminando de frente hacia la cámara.",
    tipoVideo: "marcha_frente",
    zona: "cadera",
    duracionMaxima: 15,
  },

  cadera_marcha_espaldas: {
    id: "cadera_marcha_espaldas",
    title: "Marcha de espaldas",
    description: "Graba al paciente caminando de espaldas a la cámara.",
    tipoVideo: "marcha_espaldas",
    zona: "cadera",
    duracionMaxima: 15,
  },
};
