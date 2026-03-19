const SI = "SI";

export const anamnesisSections = [
  {
    title: "4.1 Estilo de vida",
    fields: [
      {
        type: "text",
        name: "horas_sueno",
        label: "¿Cuántas horas duermes?",
        inputType: "number",
        placeholder: "Ejemplo: 7",
      },
      {
        type: "select",
        name: "horas_sentado",
        label: "¿Cuántas horas permaneces sentado o sentada?",
        options: [
          { value: "1-3", label: "1 a 3" },
          { value: "4-7", label: "4 a 7" },
          { value: ">7", label: "Más de 7" },
        ],
      },
      {
        type: "select",
        name: "horas_movimiento",
        label: "¿Cuántas horas te mueves al día?",
        options: [
          { value: "1-2", label: "1 a 2" },
          { value: "3-5", label: "3 a 5" },
          { value: "6-8", label: "6 a 8" },
        ],
      },
    ],
  },

  {
    title: "4.2 Enfermedades metabólicas",
    fields: [
      { type: "yesno", name: "diabetes", label: "¿Tienes diabetes?" },
      {
        type: "yesno",
        name: "diabetes_tratamiento",
        label: "¿Tienes tratamiento para diabetes?",
        showWhen: (data) => data.diabetes === SI,
      },
      {
        type: "yesno",
        name: "hipertension",
        label: "¿Sufres de hipertensión?",
      },
      {
        type: "yesno",
        name: "hipertension_tratamiento",
        label: "¿Tienes tratamiento para hipertensión?",
        showWhen: (data) => data.hipertension === SI,
      },
      {
        type: "yesno",
        name: "colesterol_alto",
        label: "¿Sufres de colesterol alto?",
      },
      {
        type: "yesno",
        name: "colesterol_tratamiento",
        label: "¿Tienes tratamiento para colesterol alto?",
        showWhen: (data) => data.colesterol_alto === SI,
      },
    ],
  },

  {
    title: "4.3 Obesidad",
    fields: [
      {
        type: "text",
        name: "peso",
        label: "Peso (kg)",
        inputType: "number",
        step: "0.1",
        placeholder: "Ejemplo: 70",
        grid: true,
      },
      {
        type: "text",
        name: "talla",
        label: "Talla (m)",
        inputType: "number",
        step: "0.01",
        placeholder: "Ejemplo: 1.60",
        grid: true,
      },
    ],
  },

  {
    title: "4.4 Riesgo cardiovascular",
    fields: [
      {
        type: "yesno",
        name: "infarto",
        label: "¿Te ha dado un infarto o tienes problemas de corazón?",
      },
      {
        type: "yesno",
        name: "infarto_menos_3_meses",
        label: "¿Hace menos de 3 meses?",
        showWhen: (data) => data.infarto === SI,
      },
      {
        type: "yesno",
        name: "evento_cerebrovascular",
        label: "¿Te ha dado un evento cardiovascular (derrame cerebral)?",
      },
      {
        type: "yesno",
        name: "ecv_menos_6_meses",
        label: "¿Hace menos de 6 meses?",
        showWhen: (data) => data.evento_cerebrovascular === SI,
      },
    ],
  },

  {
    title: "4.5 Enfermedades sistémicas",
    fields: [
      {
        type: "yesno",
        name: "enfermedad_higado",
        label: "¿Sufre de alguna enfermedad del hígado?",
      },
      {
        type: "yesno",
        name: "enfermedad_rinon",
        label: "¿Sufre de alguna enfermedad del riñón?",
      },
      {
        type: "yesno",
        name: "anemia",
        label: "¿Le han diagnosticado anemia?",
      },
      {
        type: "yesno",
        name: "anemia_controlada",
        label: "¿Está controlada?",
        showWhen: (data) => data.anemia === SI,
      },
      {
        type: "yesno",
        name: "enfermedad_autoinmune",
        label: "¿Tiene alguna enfermedad autoinmune?",
      },
      {
        type: "yesno",
        name: "enfermedad_psiquiatrica",
        label:
          "¿Tiene alguna enfermedad psiquiátrica que requiere tratamiento?",
      },
      {
        type: "yesno",
        name: "cancer_ultimos_5_anos",
        label: "¿Ha tenido cáncer en los últimos 5 años?",
      },
    ],
  },

  {
    title: "4.6 Procedimientos recientes",
    fields: [
      {
        type: "yesno",
        name: "cirugia_rodilla",
        label: "¿Le han realizado cirugía de rodilla?",
      },
      {
        type: "yesno",
        name: "cirugia_cadera",
        label: "¿Le han realizado cirugía de cadera?",
      },
      {
        type: "yesno",
        name: "cirugia_hombro",
        label: "¿Le han realizado cirugía de hombro?",
      },
      {
        type: "yesno",
        name: "cirugia_columna",
        label: "¿Le han realizado cirugía de columna?",
      },
      {
        type: "yesno",
        name: "cirugia_pelvis",
        label: "¿Le han realizado cirugía de pelvis?",
      },
      {
        type: "yesno",
        name: "cirugia_otra",
        label: "¿Le han realizado otra cirugía?",
      },
      {
        type: "text",
        name: "cirugia_otra_cual",
        label: "¿Cuál cirugía?",
        placeholder: "Escribe cuál",
        showWhen: (data) => data.cirugia_otra === SI,
      },
      {
        type: "yesno",
        name: "cirugia_menos_3_meses",
        label: "¿La cirugía fue hace menos de 3 meses?",
        showWhen: (data) =>
          [
            data.cirugia_rodilla,
            data.cirugia_cadera,
            data.cirugia_hombro,
            data.cirugia_columna,
            data.cirugia_pelvis,
            data.cirugia_otra,
          ].includes(SI),
      },
    ],
  },

  {
    title: "4.7 Trauma reciente",
    fields: [
      {
        type: "yesno",
        name: "golpe_pelvis",
        label: "¿Ha tenido un golpe fuerte en su pelvis en menos de 3 meses?",
      },
      {
        type: "text",
        name: "dolor_pelvis_nivel",
        label: "Nivel de dolor en pelvis (1 a 10)",
        inputType: "number",
        min: "1",
        max: "10",
        placeholder: "Ejemplo: 8",
        showWhen: (data) => data.golpe_pelvis === SI,
      },
    ],
  },

  {
    title: "4.8 Hospitalización",
    fields: [
      {
        type: "yesno",
        name: "paso_uci",
        label: "¿Ha permanecido en UCI?",
      },
      {
        type: "yesno",
        name: "uci_menos_1_ano",
        label: "¿Hace menos de 1 año?",
        showWhen: (data) => data.paso_uci === SI,
      },
      {
        type: "text",
        name: "razon_uci",
        label: "¿Cuál fue la razón?",
        placeholder: "Escribe la razón",
        showWhen: (data) => data.paso_uci === SI,
      },
    ],
  },

  {
    title: "4.9 Tratamientos oncológicos",
    fields: [
      {
        type: "yesno",
        name: "quimioterapia",
        label: "¿Ha sido sometido a tratamiento por quimioterapia?",
      },
      {
        type: "yesno",
        name: "radioterapia",
        label: "¿Ha sido sometido a tratamiento por radioterapia?",
      },
    ],
  },

  {
    title: "4.10 Hábitos",
    fields: [
      {
        type: "yesno",
        name: "fuma",
        label: "¿Usted fuma?",
      },
      {
        type: "text",
        name: "cigarrillos_dia",
        label: "¿Cuántos cigarrillos al día?",
        inputType: "number",
        min: "0",
        placeholder: "Ejemplo: 3",
        showWhen: (data) => data.fuma === SI,
      },
      {
        type: "yesno",
        name: "toma_licor",
        label: "¿Usted toma licor?",
      },
      {
        type: "select",
        name: "frecuencia_licor",
        label: "Frecuencia",
        options: [
          { value: "DIARIO", label: "Diario" },
          { value: "SEMANAL", label: "Semanal" },
          { value: "EVENTUAL", label: "Eventual" },
        ],
        showWhen: (data) => data.toma_licor === SI,
      },
    ],
  },

  {
    title: "5. Identificación de dolor",
    fields: [
      {
        type: "yesno",
        name: "dolor_rodilla",
        label: "¿Tiene dolor en rodillas?",
      },
      {
        type: "yesno",
        name: "dolor_hombro",
        label: "¿Tiene dolor en hombros?",
      },
      {
        type: "yesno",
        name: "dolor_cadera",
        label: "¿Tiene dolor en cadera?",
      },
      {
        type: "yesno",
        name: "dolor_lumbar",
        label: "¿Tiene dolor en espalda baja?",
      },
    ],
  },

  {
    title: "5.1 Diagnósticos específicos",
    fields: [
      {
        type: "yesno",
        name: "dx_artrosis_rodilla",
        label:
          "¿Tiene diagnóstico de artrosis de rodilla? (por radiografía o resonancia)",
      },
      {
        type: "yesno",
        name: "dx_artrosis_cadera",
        label:
          "¿Tiene diagnóstico de artrosis de cadera? (por radiografía o resonancia)",
      },
      {
        type: "yesno",
        name: "dx_lumbalgia_cronica",
        label:
          "¿Tiene diagnóstico de lumbalgia crónica? (dolor lumbar de más de 3 meses)",
      },
      {
        type: "yesno",
        name: "dx_manguito_rotador",
        label:
          "¿Tiene diagnóstico de daño de manguito rotador? (por ecografía o resonancia)",
      },
    ],
  },
];
