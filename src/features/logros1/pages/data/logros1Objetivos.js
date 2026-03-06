// Objetivos por síntoma (keys deben coincidir con SINTOMAS.value)

export const OBJETIVOS = {
  dolor: {
    objetivoGeneral: "Objetivo General: Disminuir el dolor",
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
    objetivoGeneral:
      "Lograr mantener una postura (sentado, acostado, de pie) por un tiempo específico",
    opciones: [
      { value: "5min", label: "Lograr mantener la postura por 5 minutos" },
      { value: "10min", label: "Lograr mantener la postura por 10 minutos" },
      { value: "15min", label: "Lograr mantener la postura por 15 minutos" },
      { value: "30min", label: "Lograr mantener la postura por 30 minutos" },
      { value: "60min", label: "Lograr mantener la postura por 1 hora o más" },
    ],
  },

  // antes: limitacion_deporte
  limitacion_actividad_fisica: {
    objetivoGeneral:
      "Objetivo General: Poder hacer actividad física o ejercicio",
    opciones: [
      {
        value: "leve",
        label: "Poder hacer ejercicio de leve intensidad (escala de Borg 3/10)",
      },
      {
        value: "moderada",
        label:
          "Poder hacer ejercicio de moderada intensidad (escala de Borg 6/10)",
      },
      {
        value: "actividad_preferencia",
        label:
          "Poder practicar la actividad de mi preferencia (trote, pádel, tenis, fútbol, pilates)",
      },
    ],
  },

  trastorno_trabajo: {
    objetivoGeneral:
      "Trabajar por un periodo de tiempo específico sin incomodidad",
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

  // antes: vida_social (pero ahora tu value es restriccion_vida_social)
  restriccion_vida_social: {
    objetivoGeneral: "Objetivo General: Tener una vida social normal",
    opciones: [
      {
        value: "cumple_familia",
        label:
          "Poder asistir a cumpleaños o actividades familiares de leve exigencia física",
      },
      { value: "misa_1h", label: "Poder ir a misa o reuniones (1 hora o más)" },
      {
        value: "eventos_2h",
        label:
          "Poder ir a cine/partidos/conciertos (2+ horas) con alta demanda física",
      },
    ],
  },

  dificultad_recrearse: {
    objetivoGeneral: "Objetivo General: Poder realizar actividades recreativas",
    opciones: [
      { value: "10_15", label: "Poder por 10–15 minutos" },
      { value: "20_30", label: "Poder por 20–30 minutos" },
      { value: "45_60", label: "Poder por 45 minutos a 1 hora" },
      { value: "sin_restriccion", label: "Poder sin restricciones" },
    ],
  },

  trastorno_dormir: {
    objetivoGeneral: "Objetivo General: Poder dormir",
    opciones: [
      { value: "conciliar", label: "Conciliar el sueño" },
      { value: "2a4", label: "Dormir de 2 a 4 horas sin molestia" },
      { value: "5a8", label: "Dormir de 5 a 8 horas sin molestia" },
      { value: "sin_dificultad", label: "Dormir sin dificultad" },
    ],
  },

  dificultad_escaleras: {
    objetivoGeneral: "Objetivo General: Poder subir o bajar escaleras",
    opciones: [
      {
        value: "lado_despacio",
        label: "Subir/bajar con ayuda, de lado y despacio",
      },
      {
        value: "simetrico",
        label:
          "Subir/bajar con ayuda, de frente, un pie alcanzando al otro (simétrico)",
      },
      {
        value: "asimetrico",
        label: "Subir/bajar con ayuda, de frente, asimétrico",
      },
      {
        value: "sin_dificultad",
        label: "Subir y bajar escaleras sin dificultad",
      },
    ],
  },

  dificultad_levantarse: {
    objetivoGeneral: "Objetivo General: Pararme sin dificultad",
    opciones: [
      { value: "con_ayuda", label: "Poder pararme con ayuda de alguien más" },
      {
        value: "dispositivo",
        label: "Poder pararme con ayuda de un dispositivo (muletas, caminador)",
      },
      {
        value: "leve_limitacion",
        label: "Poder pararme sin ayuda, con leve limitación",
      },
      { value: "sin_dificultad", label: "Poder pararme sin dificultad" },
    ],
  },

  limitacion_autocuidado: {
    objetivoGeneral: "Objetivo General: Realizar con facilidad mi autocuidado",
    opciones: [
      { value: "con_ayuda", label: "Poder bañarme y vestirme con ayuda" },
      {
        value: "algo_ayuda",
        label: "Poder bañarme y vestirme con algo de ayuda",
      },
      {
        value: "zapatos_medias",
        label: "Poder bañarme y vestirme, con ayuda para zapatos/medias",
      },
      {
        value: "independencia_total",
        label: "Poder bañarme y vestirme con independencia total",
      },
    ],
  },

  dificultad_caminar_vehiculo: {
    objetivoGeneral: "Objetivo General: Caminar y transportarme con facilidad",
    opciones: [
      { value: "pasos_cortos", label: "Poder dar algunos pasos cortos" },
      {
        value: "dolor_soportable",
        label: "Caminar con dolor y acomodarme con molestia soportable",
      },
      {
        value: "molestias_leves",
        label: "Caminar con molestias leves y acomodarme con molestias leves",
      },
      {
        value: "sin_molestias_viaje_corto",
        label: "Caminar sin dolor y viaje corto sin molestias",
      },
      { value: "actividad_fisica", label: "Caminar como actividad física" },
      {
        value: "aumentar_tiempo_distancia",
        label: "Aumentar tiempo y distancia",
      },
      { value: "aumentar_velocidad", label: "Aumentar la velocidad" },
    ],
  },

  limitacion_recoger_objetos: {
    objetivoGeneral: "Objetivo General: Poder recoger objetos del piso",
    opciones: [
      {
        value: "postura_modificada_dolor_leve",
        label: "Recoger con postura modificada e incómoda con leve dolor",
      },
      {
        value: "postura_modificada_sin_dolor",
        label: "Recoger con postura modificada sin dolor",
      },
      {
        value: "postura_correcta_molestia",
        label: "Recoger con postura correcta con algo de molestia",
      },
      {
        value: "varias_maneras_sin_dolor",
        label: "Recoger de varias maneras y sin dolor",
      },
    ],
  },

  dificultad_cargar_paquetes: {
    objetivoGeneral: "Objetivo General: Cargar paquetes de diferentes tamaños",
    opciones: [
      { value: "pequenos", label: "Cargar paquetes pequeños" },
      { value: "medianos", label: "Cargar paquetes medianos" },
      { value: "cualquier", label: "Cargar paquetes de cualquier tamaño" },
    ],
  },

  restriccion_conducir: {
    objetivoGeneral: "Objetivo General: Poder manejar carro o moto",
    opciones: [
      { value: "30min", label: "Manejar en trayectos de 30 minutos" },
      { value: "40min", label: "Manejar sin molestia por 40 minutos" },
      { value: "1h", label: "Manejar sin molestia por 1 hora" },
      { value: "2h_mas", label: "Manejar sin molestia por 2 horas o más" },
    ],
  },

  // Estos 4 “sin limitación” (si quieres objetivos para ellos, los definimos)
  sin_limitacion_caminar_mas: {
    objetivoGeneral:
      "Objetivo General: Mejorar caminata (velocidad y distancia)",
    opciones: [
      { value: "caminar_mas_rapido", label: "Caminar más rápido" },
      { value: "caminar_mas_distancia", label: "Recorrer más kilómetros" },
      { value: "mejorar_resistencia", label: "Mejorar resistencia al caminar" },
    ],
  },

  sin_limitacion_ejercicio_mas: {
    objetivoGeneral:
      "Objetivo General: Aumentar frecuencia/intensidad del ejercicio",
    opciones: [
      {
        value: "mas_frecuencia",
        label: "Hacer ejercicio más veces a la semana",
      },
      {
        value: "mas_intensidad",
        label: "Hacer ejercicio con mayor intensidad",
      },
      { value: "mejorar_condicion", label: "Mejorar condición física general" },
    ],
  },

  sin_limitacion_mejor_postura: {
    objetivoGeneral: "Objetivo General: Mejorar postura",
    opciones: [
      { value: "mejor_postura", label: "Mejorar alineación postural" },
      { value: "menos_tension", label: "Reducir tensión/incomodidad postural" },
      { value: "mas_conciencia", label: "Aumentar conciencia corporal" },
    ],
  },

  sin_limitacion_conocimiento_cuerpo: {
    objetivoGeneral: "Objetivo General: Aprender a cuidar el cuerpo",
    opciones: [
      {
        value: "educacion_cuidado",
        label: "Aprender hábitos de cuidado corporal",
      },
      { value: "prevencion_lesiones", label: "Prevenir lesiones" },
      { value: "ergonomia", label: "Mejorar ergonomía en actividades diarias" },
    ],
  },
};
