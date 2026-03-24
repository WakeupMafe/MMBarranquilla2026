import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import CheckInContent from "../components/CheckInContent";

import { supabase } from "../../../shared/lib/supabaseClient";
import { alertError, alertOk, alertConfirm } from "../../../shared/lib/alerts";
import {
  CHECKIN_UPLOAD_MODES,
  getCheckinUploadMode,
} from "../../../shared/lib/checkinUploadMode";
import { guardarCheckIn } from "../services/guardarCheckIn";
import { obtenerProfesionalesCheckin } from "../services/profesionalesCheckin";

const SESSION_KEY = "wk_profesional";

const initialForm = {
  cedula: "",
  instructor: "",
  lugarValoracion: "",
  habeasData: "",
  autorizacionImagen: "",
  seguridadSocial: "",
};

export default function CheckIn() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState(initialForm);
  const [paciente, setPaciente] = useState(null);
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  const [errores, setErrores] = useState({});
  const [advertenciaImagenMostrada, setAdvertenciaImagenMostrada] =
    useState(false);
  const [profesionales, setProfesionales] = useState([]);

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
    async function cargarProfesionales() {
      try {
        const data = await obtenerProfesionalesCheckin();
        console.log("Profesionales cargados en check-in:", data);
        setProfesionales(data);
      } catch (error) {
        console.error("Error cargando profesionales en check-in:", error);
      }
    }

    cargarProfesionales();
  }, []);

  function limpiarProcesoPorNoAutorizacion() {
    setFormData(initialForm);
    setPaciente(null);
    setErrores({});
    setAdvertenciaImagenMostrada(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrores((prev) => ({
      ...prev,
      [name]: "",
    }));

    if (name === "cedula") {
      setPaciente(null);
      setErrores((prev) => ({
        ...prev,
        paciente: "",
      }));
    }

    if (name === "autorizacionImagen" && value === "si") {
      setAdvertenciaImagenMostrada(false);
    }
  }

  function validarFormularioBase() {
    const nuevosErrores = {};

    if (!formData.cedula.trim()) {
      nuevosErrores.cedula = "Debes ingresar el número de documento.";
    }

    if (!formData.instructor.trim()) {
      nuevosErrores.instructor =
        "Debes registrar el profesional o instructor responsable.";
    }

    if (!formData.lugarValoracion.trim()) {
      nuevosErrores.lugarValoracion = "Debes indicar el lugar de valoración.";
    }

    if (!formData.habeasData) {
      nuevosErrores.habeasData =
        "Debes seleccionar una opción para el tratamiento de datos.";
    } else if (formData.habeasData !== "si") {
      nuevosErrores.habeasData =
        "Para continuar, el paciente debe autorizar el tratamiento de datos personales.";
    }

    if (!formData.autorizacionImagen) {
      nuevosErrores.autorizacionImagen =
        "Debes seleccionar una respuesta para la política de imagen.";
    }

    if (!formData.seguridadSocial) {
      nuevosErrores.seguridadSocial =
        "Debes seleccionar el tipo de seguridad social.";
    }

    if (!paciente) {
      nuevosErrores.paciente =
        "El paciente no puede iniciar el proceso porque no aparece en la base de datos.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function handleBuscarPaciente() {
    const documento = formData.cedula.trim();

    if (!documento) {
      setErrores((prev) => ({
        ...prev,
        cedula: "Ingresa el número de documento para validar al paciente.",
      }));
      return;
    }

    try {
      setLoadingBusqueda(true);
      setPaciente(null);

      const { data, error } = await supabase
        .from("participantes")
        .select(
          "numero_documento_fisico, nombre_apellido_documento, numero_telefono",
        )
        .eq("numero_documento_fisico", documento)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        setErrores((prev) => ({
          ...prev,
          paciente:
            "El paciente no puede iniciar el proceso porque no aparece en la base de datos.",
        }));

        await alertError(
          "Paciente no encontrado",
          "El paciente no puede iniciar el proceso porque no aparece en la base de datos.",
        );
        return;
      }

      setPaciente(data);
      setErrores((prev) => ({
        ...prev,
        cedula: "",
        paciente: "",
      }));

      await alertOk(
        "Paciente validado",
        "El paciente existe en la base de datos. Puedes continuar con el check-in.",
      );
    } catch (error) {
      console.error("Error validando paciente en check-in:", error);

      await alertError(
        "Error de consulta",
        "Ocurrió un error al consultar la información del paciente.",
      );
    } finally {
      setLoadingBusqueda(false);
    }
  }

  async function handleContinuar(e) {
    e.preventDefault();

    const formularioBaseValido = validarFormularioBase();
    if (!formularioBaseValido) {
      await alertError(
        "No es posible continuar",
        "Verifica los campos obligatorios del check-in antes de continuar con el proceso.",
      );
      return;
    }

    if (formData.autorizacionImagen === "no" && !advertenciaImagenMostrada) {
      setAdvertenciaImagenMostrada(true);
      setErrores((prev) => ({
        ...prev,
        autorizacionImagen:
          "La aceptación de la política de imagen es requerida para continuar con el proceso.",
      }));

      await alertError(
        "Autorización de imagen requerida",
        "La aceptación de la política de imagen es obligatoria para continuar con la anamnesis. Si el paciente no acepta este consentimiento, no podrá realizar ningún proceso.",
      );
      return;
    }

    if (formData.autorizacionImagen === "no" && advertenciaImagenMostrada) {
      const confirmarNoAceptacion = await alertConfirm({
        title: "Confirmación de no aceptación",
        text: "¿Estás seguro de no aceptar la política de imagen? De ser así, el paciente no podrá realizar ningún proceso.",
        confirmText: "Sí, no acepta",
        cancelText: "Volver y corregir",
      });

      if (!confirmarNoAceptacion) {
        return;
      }

      limpiarProcesoPorNoAutorizacion();

      await alertError(
        "Proceso no habilitado",
        "Esta persona no aceptó la política de imagen. No puede realizar ningún proceso.",
      );
      return;
    }

    const confirmar = await alertConfirm({
      title: "Confirmar check-in",
      text: "¿Deseas continuar a datos generales del paciente?",
      confirmText: "Sí, continuar",
      cancelText: "Cancelar",
    });

    if (!confirmar) return;

    try {
      const mode = getCheckinUploadMode();

      const checkInPayload = {
        cedula: formData.cedula.trim(),
        instructor: formData.instructor.trim(),
        lugarValoracion: formData.lugarValoracion.trim(),
        habeasData: formData.habeasData === "si",
        autorizacionImagen: formData.autorizacionImagen === "si",
        seguridadSocial: formData.seguridadSocial,
      };

      if (mode === CHECKIN_UPLOAD_MODES.REAL) {
        await guardarCheckIn({
          ...checkInPayload,
          profesional,
          paciente,
        });

        await alertOk(
          "Check-in guardado",
          "La información del check-in fue guardada correctamente en base de datos.",
        );
      } else {
        await alertOk(
          "Modo simulación",
          "El check-in no se guardó en base de datos porque el módulo está en simulación.",
        );
      }

      navigate("/herramientas/valoracion", {
        state: {
          profesional,
          paciente,
          checkIn: checkInPayload,
        },
      });
    } catch (error) {
      console.error("Error guardando check-in:", error);

      await alertError(
        "Error al guardar check-in",
        error?.message || "No fue posible guardar la información del check-in.",
      );
    }
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
    navigate("/herramientas");
  }

  if (!profesional) return null;

  const userName = profesional.nombre || "Profesional";
  const pacienteEncontrado = Boolean(paciente);

  return (
    <CheckInContent
      userName={userName}
      formData={formData}
      errores={errores}
      paciente={paciente}
      pacienteEncontrado={pacienteEncontrado}
      loadingBusqueda={loadingBusqueda}
      profesionales={profesionales}
      onChange={handleChange}
      onBuscarPaciente={handleBuscarPaciente}
      onContinuar={handleContinuar}
      onVolver={handleVolver}
      onLogout={handleLogout}
    />
  );
}
