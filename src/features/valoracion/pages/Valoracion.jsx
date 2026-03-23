import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { iniciarValoracionActiva } from "../utils/valoracionSession";
import { buscarClasificacionPaciente } from "../services/buscarClasificacionPaciente";
import ValoracionContent from "../components/ValoracionContent";

import { supabase } from "../../../shared/lib/supabaseClient";
import { alertConfirm, alertError, alertOk } from "../../../shared/lib/alerts";

const SESSION_KEY = "wk_profesional";

function crearPacienteSimulacro(documento) {
  return {
    numero_documento_fisico: documento,
    nombre_apellido_documento: "Usuario Simulacro",
    numero_telefono: "+573000000001",
    genero: "Simulacro",
    esSimulacro: true,
    clasificacionPaciente: {
      hizoParteMmb2025: false,
      esPacienteNuevo: true,
      esPacienteAntiguo: false,

      valoracionEncontrada: false,
      asistenciaEncontrada: false,
      encuestaLogrosRealizada: false,

      encuestaLogrosEstado: "No aplica",
      objetivosCumplidos: false,
      cantidadObjetivos: 0,
      cantidadObjetivosCumplidos: 0,

      porcentajeAsistencia: 0,
      cumpleAsistencia: false,

      clasificacionPreliminar: null,
      clasificacionSecundaria: null,
      tieneClasificacionSecundariaValida: false,
      clasificacionFinal: null,

      flujo: "NUEVO_PROCESO",
      estadoPreclasificacion: "Simulacro activo",
      mensajePreclasificacion:
        "Paciente en modo simulacro. Se habilita un flujo teórico equivalente al de un paciente nuevo.",

      ocultarDeteccionDolor: false,
      mostrarOpcionZonaSecundaria: false,
      mostrarOpcionPreliminarFuncional: false,

      zonaPrincipal: null,
      zonaSecundaria: null,
      zonaDestino: null,
      destinoSugerido: "anamnesis_global",
      mensajeFlujoGlobal:
        "Paciente de simulacro habilitado para realizar el flujo teórico de valoración inicial.",

      preclasifica: false,
      tipoAnamnesis: "Anamnesis global",
      ruta: "ruta_global",
    },
  };
}

export default function Valoracion() {
  const navigate = useNavigate();
  const location = useLocation();

  const pacienteDesdeCheckIn = location.state?.paciente || null;
  const checkIn = location.state?.checkIn || null;

  const [cedula, setCedula] = useState(
    pacienteDesdeCheckIn?.numero_documento_fisico || "",
  );
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(false);

  const profesional = useMemo(() => {
    const fromState = location.state?.profesional;
    if (fromState) return fromState;

    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state?.profesional) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(location.state.profesional),
      );
    }
  }, [location.state]);

  useEffect(() => {
    if (!profesional) {
      alertError(
        "Acceso restringido",
        "Debes ingresar tu cédula para acceder a las herramientas.",
      );
      navigate("/", { replace: true });
    }
  }, [profesional, navigate]);

  useEffect(() => {
    async function cargarPacienteDesdeCheckIn() {
      if (!pacienteDesdeCheckIn?.numero_documento_fisico) return;
      if (paciente?.clasificacionPaciente) return;

      try {
        setLoading(true);

        const documento = pacienteDesdeCheckIn.numero_documento_fisico;
        const clasificacionPaciente =
          await buscarClasificacionPaciente(documento);

        setPaciente({
          ...pacienteDesdeCheckIn,
          esSimulacro: false,
          clasificacionPaciente,
        });
      } catch (error) {
        console.error("Error cargando clasificación desde check-in:", error);

        await alertError(
          "Error de clasificación",
          "No se pudo completar la clasificación inicial del paciente validado en el check-in.",
        );
      } finally {
        setLoading(false);
      }
    }

    cargarPacienteDesdeCheckIn();
  }, [pacienteDesdeCheckIn, paciente]);

  async function handleBuscar(e) {
    e.preventDefault();

    if (!cedula.trim()) {
      await alertError("Falta información", "Debes ingresar una cédula.");
      return;
    }

    try {
      setLoading(true);

      const documento = cedula.trim();

      const { data, error } = await supabase
        .from("participantes")
        .select(
          "numero_documento_fisico, nombre_apellido_documento, numero_telefono, genero",
        )
        .eq("numero_documento_fisico", documento)
        .single();

      if (error || !data) {
        setPaciente(null);

        const crearSimulacro = await alertConfirm({
          title: "Paciente no encontrado",
          text: "Este paciente no existe en la base de datos. ¿Deseas iniciar un proceso de simulacro?",
          confirmText: "Sí, iniciar simulacro",
          cancelText: "Cancelar",
        });

        if (!crearSimulacro) return;

        const pacienteSimulacro = crearPacienteSimulacro(documento);
        setPaciente(pacienteSimulacro);

        await alertOk(
          "Simulacro habilitado",
          "Se creó un paciente de simulacro para continuar con el flujo teórico de valoración.",
        );

        return;
      }

      const clasificacionPaciente =
        await buscarClasificacionPaciente(documento);

      setPaciente({
        ...data,
        esSimulacro: false,
        clasificacionPaciente,
      });
    } catch (error) {
      console.error("Error consultando paciente:", error);

      await alertError(
        "Error de consulta",
        error.message || "No se pudo consultar el paciente.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleContinuar() {
    if (!paciente?.clasificacionPaciente) return;

    iniciarValoracionActiva({
      ...paciente,
      checkIn,
    });

    navigate("/herramientas/anamnesis-global", {
      state: {
        profesional,
        paciente,
        checkIn,
      },
    });
  }

  async function handleLogout() {
    const ok = await alertConfirm({
      title: "Cerrar sesión",
      text: "¿Deseas salir de la plataforma?",
      confirmText: "Sí, salir",
      cancelText: "Cancelar",
    });

    if (!ok) return;

    sessionStorage.removeItem(SESSION_KEY);
    await alertOk("Sesión cerrada", "Has salido correctamente.");
    navigate("/", { replace: true });
  }

  function handleVolver() {
    navigate(
      pacienteDesdeCheckIn
        ? "/herramientas/valoracion/check-in"
        : "/herramientas",
    );
  }

  if (!profesional) return null;

  const userName = profesional.nombre || "Profesional";
  const vieneDesdeCheckIn = Boolean(pacienteDesdeCheckIn);

  return (
    <ValoracionContent
      userName={userName}
      vieneDesdeCheckIn={vieneDesdeCheckIn}
      cedula={cedula}
      setCedula={setCedula}
      loading={loading}
      paciente={paciente}
      onBuscar={handleBuscar}
      onContinuar={handleContinuar}
      onLogout={handleLogout}
      onVolver={handleVolver}
    />
  );
}
