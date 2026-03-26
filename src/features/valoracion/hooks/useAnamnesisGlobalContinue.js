import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  alertConfirm,
  alertError,
  alertOk,
  alertSelect,
} from "../../../shared/lib/alerts";

import {
  ANAMNESIS_GLOBAL_UPLOAD_MODES,
  getAnamnesisGlobalUploadMode,
} from "../../../shared/lib/anamnesisGlobalUploadMode";

import { guardarAnamnesisGlobal } from "../services/guardarAnamnesisGlobal";
import { limpiarAnamnesisGlobalDraft } from "../utils/anamnesisGlobalDraft";
import {
  construirOpcionesContinuidad,
  obtenerZonasCambioDisponibles,
} from "../utils/construirOpcionesContinuidad";

export function useAnamnesisGlobalContinue({
  resultado,
  formDataNormalizado,
  clasificacionPaciente,
  valoracionActiva,
  profesional,
}) {
  const navigate = useNavigate();

  // =========================================================
  // 1) NAVEGACIÓN A FOTOS
  // =========================================================
  // Esta función envía al módulo de fotos con la zona elegida.
  const irAFotos = useCallback(
    (zonaProtocoloFotos) => {
      const pacienteActivo = valoracionActiva?.paciente || null;

      const cedulaPacienteActual =
        valoracionActiva?.paciente?.numero_documento_fisico ||
        valoracionActiva?.paciente?.num_documento ||
        valoracionActiva?.paciente?.cedula ||
        "";

      navigate("/herramientas/fotos-test", {
        state: {
          resultado,
          formData: formDataNormalizado,
          clasificacionPaciente,
          zonaProtocoloFotos,
          zonaSeleccionadaFinal: zonaProtocoloFotos,
          profesional,
          paciente: pacienteActivo,
          cedula: cedulaPacienteActual,
        },
      });
    },
    [
      navigate,
      resultado,
      formDataNormalizado,
      clasificacionPaciente,
      profesional,
      valoracionActiva,
    ],
  );

  // =========================================================
  // 2) NAVEGACIÓN A ANAMNESIS DE ZONA (CAMBIO MANUAL)
  // =========================================================
  // Esta función se usa cuando el usuario elige UNA zona puntual
  // desde opciones de continuidad o cambio de diagnóstico.
  const irAAnamnesisZona = useCallback(
    (zonaElegida, zonasDisponiblesCambio = []) => {
      navigate("/herramientas/anamnesis-zona", {
        state: {
          zonasDetectadas: [zonaElegida],
          resultado,
          formData: formDataNormalizado,
          clasificacionPaciente,
          esCambioDiagnostico: true,
          zonasDisponiblesCambio,
          zonaSeleccionadaCambio: zonaElegida,
        },
      });
    },
    [navigate, resultado, formDataNormalizado, clasificacionPaciente],
  );

  // =========================================================
  // 3) NAVEGACIÓN DIRECTA A ANAMNESIS DE ZONA PARA PACIENTES NUEVOS
  // =========================================================
  // Esta función es la corrección importante.
  // Aquí mandamos TODAS las zonas detectadas directamente,
  // sin mostrar modal de opciones.
  const irAAnamnesisZonaDirecta = useCallback(
    (zonasDetectadas = []) => {
      navigate("/herramientas/anamnesis-zona", {
        state: {
          zonasDetectadas,
          resultado,
          formData: formDataNormalizado,
          clasificacionPaciente,
          esCambioDiagnostico: false,
          zonasDisponiblesCambio: [],
          zonaSeleccionadaCambio: null,
        },
      });
    },
    [navigate, resultado, formDataNormalizado, clasificacionPaciente],
  );

  // =========================================================
  // 4) CONTINUAR DESPUÉS DE GUARDAR ANAMNESIS GLOBAL
  // =========================================================
  // Aquí se guarda la información y se decide la siguiente ruta.
  const handleContinuar = useCallback(async () => {
    if (!resultado) return;

    // ---------------------------------------------------------
    // 4.1) Bloqueo por revisión crítica
    // ---------------------------------------------------------
    if (resultado.siguientePaso === "revision_critica") {
      await alertError(
        "Paciente alertado para revisión",
        "El paciente ha marcado criterios críticos que no permiten su clasificación al programa.",
      );
      return;
    }

    // ---------------------------------------------------------
    // 4.2) Confirmación antes de guardar
    // ---------------------------------------------------------
    const ok = await alertConfirm({
      title: "Guardar primera fase",
      text: "La anamnesis global quedará guardada y pasarás a la siguiente fase. ¿Deseas continuar?",
      confirmText: "Continuar",
      cancelText: "Seguir editando",
    });

    if (!ok) return;

    try {
      const mode = getAnamnesisGlobalUploadMode();

      const cedulaPacienteActual = String(
        valoracionActiva?.paciente?.numero_documento_fisico ||
          valoracionActiva?.paciente?.num_documento ||
          valoracionActiva?.paciente?.cedula ||
          "",
      ).trim();

      if (!cedulaPacienteActual) {
        await alertError(
          "Paciente no identificado",
          "No fue posible identificar la cédula del paciente para guardar la anamnesis global.",
        );
        return;
      }

      // -------------------------------------------------------
      // 4.3) Payload para guardar en BD
      // -------------------------------------------------------
      const payload = {
        numero_documento_fisico: cedulaPacienteActual,

        horas_sueno: formDataNormalizado.horas_sueno || null,
        horas_sentado: formDataNormalizado.horas_sentado || null,
        horas_movimiento: formDataNormalizado.horas_movimiento || null,

        diabetes: formDataNormalizado.diabetes || null,
        diabetes_tratamiento: formDataNormalizado.diabetes_tratamiento || null,
        hipertension: formDataNormalizado.hipertension || null,
        hipertension_tratamiento:
          formDataNormalizado.hipertension_tratamiento || null,
        colesterol_alto: formDataNormalizado.colesterol_alto || null,
        colesterol_tratamiento:
          formDataNormalizado.colesterol_tratamiento || null,

        infarto: formDataNormalizado.infarto || null,
        infarto_menos_3_meses:
          formDataNormalizado.infarto_menos_3_meses || null,
        evento_cerebrovascular:
          formDataNormalizado.evento_cerebrovascular || null,
        ecv_menos_6_meses: formDataNormalizado.ecv_menos_6_meses || null,

        enfermedad_higado: formDataNormalizado.enfermedad_higado || null,
        enfermedad_rinon: formDataNormalizado.enfermedad_rinon || null,
        anemia: formDataNormalizado.anemia || null,
        anemia_controlada: formDataNormalizado.anemia_controlada || null,
        enfermedad_autoinmune:
          formDataNormalizado.enfermedad_autoinmune || null,
        enfermedad_psiquiatrica:
          formDataNormalizado.enfermedad_psiquiatrica || null,
        cancer_ultimos_5_anos:
          formDataNormalizado.cancer_ultimos_5_anos || null,

        cirugia_rodilla: formDataNormalizado.cirugia_rodilla || null,
        cirugia_cadera: formDataNormalizado.cirugia_cadera || null,
        cirugia_hombro: formDataNormalizado.cirugia_hombro || null,
        cirugia_columna: formDataNormalizado.cirugia_columna || null,
        cirugia_pelvis: formDataNormalizado.cirugia_pelvis || null,
        cirugia_otra: formDataNormalizado.cirugia_otra || null,
        cirugia_otra_cual: formDataNormalizado.cirugia_otra_cual || null,
        cirugia_menos_3_meses:
          formDataNormalizado.cirugia_menos_3_meses || null,

        golpe_pelvis: formDataNormalizado.golpe_pelvis || null,
        dolor_pelvis_nivel: formDataNormalizado.dolor_pelvis_nivel || null,

        paso_uci: formDataNormalizado.paso_uci || null,
        uci_menos_1_ano: formDataNormalizado.uci_menos_1_ano || null,
        razon_uci: formDataNormalizado.razon_uci || null,

        quimioterapia: formDataNormalizado.quimioterapia || null,
        radioterapia: formDataNormalizado.radioterapia || null,

        fuma: formDataNormalizado.fuma || null,
        cigarrillos_dia: formDataNormalizado.cigarrillos_dia || null,
        toma_licor: formDataNormalizado.toma_licor || null,
        frecuencia_licor: formDataNormalizado.frecuencia_licor || null,

        dolor_rodilla: formDataNormalizado.dolor_rodilla || null,
        dolor_cadera: formDataNormalizado.dolor_cadera || null,
        dolor_lumbar: formDataNormalizado.dolor_lumbar || null,
        dolor_hombro: formDataNormalizado.dolor_hombro || null,

        dx_artrosis_rodilla: formDataNormalizado.dx_artrosis_rodilla || null,
        dx_artrosis_cadera: formDataNormalizado.dx_artrosis_cadera || null,
        dx_lumbalgia_cronica: formDataNormalizado.dx_lumbalgia_cronica || null,
        dx_manguito_rotador: formDataNormalizado.dx_manguito_rotador || null,

        alertas: resultado.alertas || [],
        descartado: Boolean(resultado.descartado),
        motivos_descarte: resultado.motivosDescarte || [],
        zonas_detectadas: resultado.zonasDetectadas || [],
        cantidad_zonas_dolor: Number(resultado.cantidadZonasDolor || 0),
        pendiente_aprobacion: Boolean(resultado.pendienteAprobacion),
        siguiente_paso: resultado.siguientePaso || null,
        mensaje_resultado: resultado.mensajeResultado || null,
      };

      // -------------------------------------------------------
      // 4.4) Guardado real o simulación
      // -------------------------------------------------------
      if (mode === ANAMNESIS_GLOBAL_UPLOAD_MODES.REAL) {
        await guardarAnamnesisGlobal(payload);

        await alertOk(
          "Anamnesis global guardada",
          "La anamnesis global fue guardada correctamente en base de datos.",
        );
      } else {
        await alertOk(
          "Modo simulación",
          "La anamnesis global no se guardó en base de datos porque el módulo está en simulación.",
        );
      }

      // -------------------------------------------------------
      // 4.5) Limpiar draft local
      // -------------------------------------------------------
      limpiarAnamnesisGlobalDraft();

      // -------------------------------------------------------
      // 4.6) CORRECCIÓN PARA PACIENTES NUEVOS
      // -------------------------------------------------------
      // Si es paciente nuevo y el resultado indica anamnesis de zona,
      // NO se debe mostrar modal con opciones.
      // Solo informamos y navegamos directo con TODAS las zonas detectadas.
      const esPacienteNuevo = Boolean(clasificacionPaciente?.esPacienteNuevo);
      const zonasDetectadas = Array.isArray(resultado?.zonasDetectadas)
        ? resultado.zonasDetectadas
        : [];

      if (
        esPacienteNuevo &&
        resultado?.siguientePaso === "anamnesis_especifica_zona" &&
        zonasDetectadas.length > 0
      ) {
        await alertOk(
          "Continuación definida",
          "Iniciaremos la anamnesis de las zonas seleccionadas.",
        );

        irAAnamnesisZonaDirecta(zonasDetectadas);
        return;
      }

      // -------------------------------------------------------
      // 4.7) Construcción normal de opciones de continuidad
      // -------------------------------------------------------
      // Esto aplica para pacientes antiguos o flujos que sí requieren decisión.
      const opcionesContinuidad = construirOpcionesContinuidad({
        resultado,
        clasificacionPaciente,
      });

      if (!opcionesContinuidad.length) {
        await alertError(
          "Ruta no disponible",
          "No se encontraron opciones de continuidad para este paciente.",
        );
        return;
      }

      // -------------------------------------------------------
      // 4.8) Si solo hay una opción, navegar directo
      // -------------------------------------------------------
      if (opcionesContinuidad.length === 1) {
        const unica = opcionesContinuidad[0];

        if (unica.tipo === "fotos") {
          irAFotos(unica.zona || "funcional");
          return;
        }

        if (unica.tipo === "anamnesis_zona") {
          irAAnamnesisZona(
            unica.zona,
            unica.zonasDisponiblesCambio ||
              obtenerZonasCambioDisponibles(clasificacionPaciente),
          );
          return;
        }

        await alertError(
          "Ruta no disponible",
          "La opción encontrada no tiene una navegación válida.",
        );
        return;
      }

      // -------------------------------------------------------
      // 4.9) Si hay varias opciones, mostrar selector
      // -------------------------------------------------------
      // Este bloque ya NO se ejecuta para pacientes nuevos con zonas detectadas,
      // porque arriba salimos antes con return.
      const inputOptions = Object.fromEntries(
        opcionesContinuidad.map((opcion) => [opcion.value, opcion.label]),
      );

      const seleccion = await alertSelect({
        title: "Definir continuidad terapéutica",
        text: "Selecciona cómo deseas continuar con este paciente.",
        inputOptions,
        inputPlaceholder: "Selecciona una opción",
        confirmButtonText: "Continuar",
        cancelButtonText: "Cancelar",
      });

      if (!seleccion) {
        return;
      }

      const opcionElegida =
        opcionesContinuidad.find((opcion) => opcion.value === seleccion) ||
        null;

      if (!opcionElegida) {
        await alertError(
          "Selección inválida",
          "No se pudo identificar la opción seleccionada.",
        );
        return;
      }

      if (opcionElegida.tipo === "fotos") {
        irAFotos(opcionElegida.zona || "funcional");
        return;
      }

      if (opcionElegida.tipo === "anamnesis_zona") {
        irAAnamnesisZona(
          opcionElegida.zona,
          opcionElegida.zonasDisponiblesCambio ||
            obtenerZonasCambioDisponibles(clasificacionPaciente),
        );
        return;
      }

      await alertError(
        "Ruta no disponible",
        "La opción seleccionada no tiene una ruta válida.",
      );
    } catch (error) {
      console.error("Error guardando anamnesis global:", error);

      await alertError(
        "Error al guardar anamnesis global",
        error?.message || "No fue posible guardar la anamnesis global.",
      );
    }
  }, [
    resultado,
    formDataNormalizado,
    clasificacionPaciente,
    valoracionActiva,
    profesional,
    navigate,
    irAFotos,
    irAAnamnesisZona,
    irAAnamnesisZonaDirecta,
  ]);

  return {
    handleContinuar,
  };
}
