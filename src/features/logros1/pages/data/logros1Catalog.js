// Catálogo Logros Fase 1 (desde la pregunta 4 del PDF)

export const LIMITACION_MOVERSE = [
  { value: "mucho", label: "Mucho" },
  { value: "bastante", label: "Bastante" },
  { value: "poco", label: "Poco" },
  { value: "nada", label: "Nada" },
];

export const ACTIVIDADES_AFECTADAS = [
  { value: "tareas_hogar", label: "Tareas del hogar" },
  {
    value: "autocuidado",
    label: "Autocuidado (bañarse - vestirse - alimentarse)",
  },
  { value: "laborales", label: "Laborales" },
  { value: "vida_social_familiar", label: "Vida social o familiar" },
  { value: "ocio", label: "Ocio" },
  { value: "actividad_fisica", label: "Actividad física/Ejercicio" },
];

// En tu DB se llaman “sintoma_1..3”, así que aquí lo llamamos SINTOMAS (aunque el PDF dice “problemas”).
export const SINTOMAS = [
  { value: "dolor", label: "Dolor" },
  {
    value: "intolerancia_postura",
    label:
      "Intolerancia para mantener una posición por el tiempo deseado o necesario (Sentado - o de pie)",
  },
  {
    value: "limitacion_actividad_fisica",
    label: "Limitación para hacer actividad física o ejercicio",
  },
  {
    value: "trastorno_trabajo",
    label:
      "Trastorno para mantener el ritmo de trabajo o trabajar (Tiene que parar con frecuencia)",
  },
  {
    value: "restriccion_vida_social",
    label: "Restricción para hacer vida social",
  },
  { value: "dificultad_recrearse", label: "Dificultad para recrearse" },
  { value: "trastorno_dormir", label: "Trastorno para dormir" },
  {
    value: "dificultad_escaleras",
    label: "Dificultad subir o bajar escaleras",
  },
  {
    value: "dificultad_levantarse",
    label: "Dificultad para levantarse de la cama o pararse de una silla",
  },
  { value: "limitacion_autocuidado", label: "Limitación para el autocuidado" },
  {
    value: "dificultad_caminar_vehiculo",
    label:
      "Dificultad para caminar, acomodarse en un carro o montarse en un vehículo",
  },
  {
    value: "limitacion_recoger_objetos",
    label: "Limitación para adoptar la postura para recoger objetos",
  },
  {
    value: "dificultad_cargar_paquetes",
    label: "Dificultad para cargar paquetes u objetos de diferentes pesos",
  },
  {
    value: "restriccion_conducir",
    label:
      "Restricción para conducir carro o moto sea por cortos o largos periodos de tiempo.",
  },
  {
    value: "sin_limitacion_caminar_mas",
    label:
      "No tengo limitación pero me gustaría poder caminar más rápido y recorrer más kilómetros",
  },
  {
    value: "sin_limitacion_ejercicio_mas",
    label:
      "No tengo limitación, pero me gustaría poder hacer ejercicio de moderada a alta intensidad más veces a la semana",
  },
  {
    value: "sin_limitacion_mejor_postura",
    label: "No tengo limitación, pero me gustaría tener una mejor postura",
  },
  {
    value: "sin_limitacion_conocimiento_cuerpo",
    label:
      "No tengo limitación pero me gustaría saber más de mi cuerpo y cómo cuidarlo",
  },
  { value: "otro", label: "Otro" },
];
