// Objetivos por síntoma (keys deben coincidir con SINTOMAS.value)

export const OBJETIVOS = {
  dolor: {
    opciones: [
      { value: "dolor_disminuya", label: "Que el dolor disminuya" },
      {
        value: "dolor_leve",
        label: "Que el dolor disminuya y pase a ser leve/tolerable",
      },
      {
        value: "dolor_desaparece_mayor_parte",
        label: "Que el dolor desaparezca la mayor parte del tiempo",
      },
      { value: "dolor_desaparece", label: "Que el dolor desaparezca" },
    ],
  },

  intolerancia_postura: {
    opciones: [
      { value: "5min", label: "Lograr mantener la postura por 5 minutos" },
      { value: "10min", label: "Lograr mantener la postura por 10 minutos" },
      { value: "15min", label: "Lograr mantener la postura por 15 minutos" },
      { value: "30min", label: "Lograr mantener la postura por 30 minutos" },
      { value: "60min", label: "Lograr mantener la postura por 1 hora o más" },
    ],
  },

  limitacion_actividad_fisica: {
    opciones: [
      {
        value: "leve",
        label:
          "Poder hacer los ejercicios del programa con algo de limitación y algo de dolor",
      },
      {
        value: "sin_limitacion_sin_dolor",
        label:
          "Poder hacer los ejercicios del programa sin limitación y sin dolor",
      },
      {
        value: "agil_sin_dolor",
        label: "Poder hacer los ejercicios de manera ágil y sin dolor",
      },
      {
        value: "alta_intensidad",
        label: "Poder hacer ejercicio de mayor intensidad (aeróbicos - rumba)",
      },
    ],
  },

  trastorno_trabajo: {
    opciones: [
      { value: "15min", label: "Poder trabajar por 15 minutos" },
      { value: "30min", label: "Poder trabajar por 30 minutos" },
      { value: "1a3h", label: "Poder trabajar de 1 a 3 horas" },
      {
        value: "7h",
        label: "Poder trabajar una jornada de 7 horas sin limitación",
      },
    ],
  },

  restriccion_vida_social: {
    opciones: [
      {
        value: "cumple_familia",
        label:
          "Poder asistir a cumpleaños o actividades familiares de leve exigencia física",
      },
      {
        value: "misa_1h",
        label:
          "Poder ir a misa o reuniones religiosas de 1 hora o más de duración",
      },
      {
        value: "eventos_2h",
        label:
          "Poder ir a cine, partidos de fútbol, conciertos, de 2 o más horas de duración y con alta demanda física",
      },
      {
        value: "marchas_bailes",
        label:
          "Poder participar de marchas, bailes y comparsas, caminando y estando de pie por largos periodos de tiempo",
      },
    ],
  },

  dificultad_recrearse: {
    opciones: [
      { value: "10_15", label: "Poder por 10 - 15 minutos" },
      { value: "20_30", label: "Poder por 20 30 minutos" },
      { value: "45_60", label: "Poder por 45 minutos a 1 hora" },
      { value: "sin_restriccion", label: "Poder sin restricciones" },
    ],
  },

  trastorno_dormir: {
    opciones: [
      { value: "conciliar", label: "Quedarme dormido (conciliar el sueño)" },
      { value: "2a4", label: "Dormir de 2 a 4 horas sin molestia" },
      { value: "5a8", label: "Dormir de 5 a 8 horas sin molestia" },
      { value: "sin_dificultad", label: "Dormir sin dificultad" },
    ],
  },

  dificultad_escaleras: {
    opciones: [
      {
        value: "lado_despacio",
        label:
          "Subir o bajar escaleras, agarrado de una baranda o con ayuda, de lado y despacio",
      },
      {
        value: "simetrico",
        label:
          "Subir o bajar escaleras, agarrado de una baranda, con ayuda, de frente, un pie alcanzando al otro (simétrico)",
      },
      {
        value: "asimetrico",
        label:
          "Subir o bajar escaleras agarrado de una baranda o pared, de frente y sin alcanzar el otro pie (asimétrico)",
      },
      {
        value: "sin_dificultad",
        label: "Poder bajar y subir escaleras sin dificultad",
      },
    ],
  },

  dificultad_levantarse: {
    opciones: [
      { value: "con_ayuda", label: "Poder pararme con ayuda de alguien más" },
      {
        value: "dispositivo",
        label:
          "Poder pararme sólo pero con ayuda de un dispositivo (muletas - caminador)",
      },
      {
        value: "leve_limitacion",
        label:
          "Poder pararme sin ayuda de alguien y sin dispositivo con leve limitación",
      },
      { value: "sin_dificultad", label: "Poder pararme sin dificultad" },
    ],
  },

  limitacion_autocuidado: {
    opciones: [
      { value: "con_ayuda", label: "Poder bañarme y vestirme con ayuda" },
      {
        value: "algo_ayuda",
        label: "Poder bañarme y vestirme con algo de ayuda",
      },
      {
        value: "zapatos_medias",
        label:
          "Poder bañarme y vestirme pero aún con ayuda para amarrarme los zapatos o ponerme las medias",
      },
      {
        value: "independencia_total",
        label: "Poder bañarme, vestirme con independencia total",
      },
    ],
  },

  dificultad_caminar_vehiculo: {
    opciones: [
      {
        value: "actividad_fisica",
        label: "Poder caminar como actividad física",
      },
      {
        value: "aumentar_tiempo_distancia",
        label: "Poder caminar aumentando el tiempo y la distancia",
      },
      {
        value: "aumentar_velocidad",
        label: "Poder caminar aumentando la velocidad",
      },
      {
        value: "terreno_irregular",
        label: "Poder caminar en terreno irregular y pendientes",
      },
    ],
  },

  limitacion_recoger_objetos: {
    opciones: [
      {
        value: "postura_modificada_dolor_leve",
        label:
          "Lograr recoger objetos del piso, asumiendo una postura modificada e incómoda para conseguirlo con leve dolor",
      },
      {
        value: "postura_modificada_sin_dolor",
        label:
          "Lograr recoger objetos del piso, con una postura modificada algo incómoda pero sin dolor",
      },
      {
        value: "postura_correcta_molestia",
        label:
          "Lograr recoger objetos del piso asumiendo la postura correcta pero con algo de molestia",
      },
      {
        value: "varias_maneras_sin_dolor",
        label: "Recoger objetos de piso de varias maneras y sin dolor",
      },
    ],
  },

  dificultad_cargar_paquetes: {
    opciones: [
      { value: "pequenos", label: "Cargar paquetes pequeños" },
      { value: "medianos", label: "Cargar paquetes medianos" },
      { value: "cualquier", label: "Cargar paquetes de cualquier tamaño" },
    ],
  },

  restriccion_conducir: {
    opciones: [
      {
        value: "30min",
        label: "Manejar carro o moto en trayectos de 30 minutos",
      },
      {
        value: "40min",
        label: "Manejar carro o moto sin molestia por 40 minutos",
      },
      { value: "1h", label: "Manejar carro o moto sin molestia por 1 hora" },
      {
        value: "2h_mas",
        label: "Manejar carro o moto sin molestia por 2 horas o más",
      },
    ],
  },

  sin_limitacion_caminar_mas: {
    opciones: [
      {
        value: "8km_2h",
        label: "Caminar por 2 horas aproximadamente 8 kilómetros",
      },
      {
        value: "12km_3h",
        label: "Caminar por 3 horas, aproximadamente 12 kilómetros",
      },
      {
        value: "4h_mas",
        label: "Caminar por 4 horas o más",
      },
    ],
  },

  sin_limitacion_ejercicio_mas: {
    opciones: [
      {
        value: "1x_semana",
        label:
          "Poder hacer ejercicio de moderada intensidad: rumba, aeróbicos, pesas 1 vez a la semana",
      },
      {
        value: "2x_semana",
        label:
          "Poder hacer ejercicio de moderada intensidad 2 veces por semana",
      },
      {
        value: "3x_semana",
        label: "Poder hacer ejercicio de alta intensidad 3 veces por semana",
      },
    ],
  },

  sin_limitacion_mejor_postura: {
    opciones: [
      {
        value: "tronco_erguido",
        label:
          "Tener una mejor postura al caminar: tronco más derecho y una postura más erguida",
      },
      {
        value: "menos_agachado",
        label:
          "Tener una mejor postura cuando me siento: tronco derecho sin estar agachado",
      },
      {
        value: "que_lo_noten",
        label:
          "Tener una mejor postura y que las personas a mi alrededor lo noten",
      },
    ],
  },

  sin_limitacion_conocimiento_cuerpo: {
    opciones: [
      {
        value: "pelvis_en_casa",
        label: "Conocer como puedo fortalecer mi pelvis en casa",
      },
      {
        value: "musculos_pelvis",
        label:
          "Conocer los músculos más importantes de la pelvis y los ejercicios para lograrlo",
      },
      {
        value: "10_ejercicios",
        label:
          "Conocer al menos 10 ejercicios preventivos para mi cuerpo y la razón de por qué son importantes",
      },
      {
        value: "ideas_fundamentales",
        label: "Entender las ideas fundamentales de la cartilla MMB",
      },
    ],
  },
};
