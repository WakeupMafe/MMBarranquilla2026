import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { iniciarValoracionActiva } from "../utils/valoracionSession";
import { buscarClasificacionPaciente } from "../services/buscarClasificacionPaciente";
import ValoracionContent from "../components/ValoracionContent";
import EditarPacienteModal from "../components/EditarPacienteModal";

import { supabase } from "../../../shared/lib/supabaseClient";
import { alertConfirm, alertError, alertOk } from "../../../shared/lib/alerts";
import { normalizarDocumentoCkin } from "../config/validarCedulaCkin";

const SESSION_KEY = "wk_profesional";

function validarCedulaBasica(cedula) {
  const valor = String(cedula || "").trim();
  return /^\d{5,20}$/.test(valor);
}

function construirEstadoCalidadPaciente(paciente) {
  const problemas = [];

  if (!validarCedulaBasica(paciente?.numero_documento_fisico)) {
    problemas.push("Cédula inválida o incompleta");
  }

  if (!String(paciente?.genero || "").trim()) {
    problemas.push("Falta género");
  }

  if (!String(paciente?.fecha_nacimiento || "").trim()) {
    problemas.push("Falta fecha de nacimiento");
  }

  return {
    requiereCorreccion: problemas.length > 0,
    problemas,
  };
}

async function obtenerPacientePorDocumento(documento) {
  const { data, error } = await supabase
    .from("participantes")
    .select(
      "numero_documento_fisico, nombre_apellido_documento, numero_telefono, genero, fecha_nacimiento",
    )
    .eq("numero_documento_fisico", String(documento || "").trim())
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

export default function Valoracion() {
  const navigate = useNavigate();
  const location = useLocation();

  const pacienteDesdeCheckIn = location.state?.paciente || null;
  const checkIn = location.state?.checkIn || null;

  const [cedula, setCedula] = useState(() =>
    normalizarDocumentoCkin(
      pacienteDesdeCheckIn?.numero_documento_fisico || "",
    ),
  );
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Estados del modal de edición
  const [modalEdicionVisible, setModalEdicionVisible] = useState(false);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [formEdicion, setFormEdicion] = useState({
    nombre_apellido_documento: "",
    genero: "",
    numero_telefono: "",
    fecha_nacimiento: "",
  });

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

      const documento = normalizarDocumentoCkin(
        pacienteDesdeCheckIn.numero_documento_fisico || "",
      );
      if (!documento) return;

      try {
        setLoading(true);

        const pacienteBd = await obtenerPacientePorDocumento(documento);
        const pacienteBase = pacienteBd || pacienteDesdeCheckIn;

        const clasificacionPaciente =
          await buscarClasificacionPaciente(documento);

        const estadoCalidad = construirEstadoCalidadPaciente(pacienteBase);

        setPaciente({
          ...pacienteBase,
          clasificacionPaciente,
          estadoCalidad,
        });

        setCedula(documento);
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
  }, [pacienteDesdeCheckIn]);

  async function handleBuscar(e) {
    e.preventDefault();

    if (!normalizarDocumentoCkin(cedula)) {
      await alertError("Falta información", "Debes ingresar una cédula.");
      return;
    }

    try {
      setLoading(true);

      const documento = normalizarDocumentoCkin(cedula);
      if (!documento) {
        await alertError(
          "Documento inválido",
          "Ingresa un número de documento válido.",
        );
        return;
      }

      const data = await obtenerPacientePorDocumento(documento);

      if (!data) {
        setPaciente(null);

        await alertError(
          "Paciente no encontrado",
          "Este paciente no existe en la base de datos. Verifica la cédula antes de continuar.",
        );

        return;
      }

      const clasificacionPaciente =
        await buscarClasificacionPaciente(documento);

      const estadoCalidad = construirEstadoCalidadPaciente(data);

      setPaciente({
        ...data,
        clasificacionPaciente,
        estadoCalidad,
      });

      setCedula(documento);
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

  function handleEditarDatos() {
    if (!paciente) {
      alertError(
        "Paciente no disponible",
        "No se encontró información del paciente para editar.",
      );
      return;
    }

    setFormEdicion({
      nombre_apellido_documento: paciente.nombre_apellido_documento || "",
      genero: paciente.genero || "",
      numero_telefono: paciente.numero_telefono || "",
      fecha_nacimiento: paciente.fecha_nacimiento || "",
    });

    setModalEdicionVisible(true);
  }

  function handleChangeEdicion(e) {
    const { name, value } = e.target;

    setFormEdicion((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSaveEdicion() {
    if (!paciente?.numero_documento_fisico) {
      await alertError(
        "Paciente no válido",
        "No se encontró la cédula del paciente para guardar cambios.",
      );
      return;
    }

    try {
      setGuardandoEdicion(true);

      const payload = {
        nombre_apellido_documento: String(
          formEdicion.nombre_apellido_documento || "",
        ).trim(),
        genero: String(formEdicion.genero || "").trim() || null,
        numero_telefono:
          String(formEdicion.numero_telefono || "").trim() || null,
        fecha_nacimiento: formEdicion.fecha_nacimiento || null,
      };

      const { error } = await supabase
        .from("participantes")
        .update(payload)
        .eq("numero_documento_fisico", paciente.numero_documento_fisico);

      if (error) {
        throw error;
      }

      const pacienteActualizado = {
        ...paciente,
        ...payload,
      };

      const estadoCalidad = construirEstadoCalidadPaciente(pacienteActualizado);

      setPaciente({
        ...pacienteActualizado,
        estadoCalidad,
      });

      setModalEdicionVisible(false);

      await alertOk(
        "Datos actualizados",
        "La información del paciente fue actualizada correctamente.",
      );
    } catch (error) {
      console.error("Error actualizando paciente:", error);

      await alertError(
        "Error al guardar",
        error.message || "No se pudieron guardar los cambios.",
      );
    } finally {
      setGuardandoEdicion(false);
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
    navigate("/herramientas/valoracion/check-in");
  }

  if (!profesional) return null;

  const userName = profesional.nombre || "Profesional";
  const vieneDesdeCheckIn = Boolean(pacienteDesdeCheckIn);

  return (
    <>
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
        onEditarDatos={handleEditarDatos}
      />

      <EditarPacienteModal
        visible={modalEdicionVisible}
        loading={guardandoEdicion}
        formEdicion={formEdicion}
        onChange={handleChangeEdicion}
        onClose={() => setModalEdicionVisible(false)}
        onSave={handleSaveEdicion}
      />
    </>
  );
}
