import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import CheckInContent from "../components/CheckInContent";

import { alertError, alertOk, alertConfirm } from "../../../shared/lib/alerts";
import {
  CHECKIN_UPLOAD_MODES,
  getCheckinUploadMode,
} from "../../../shared/lib/checkinUploadMode";
import { guardarCheckIn } from "../services/guardarCheckIn";
import { obtenerProfesionalesCheckin } from "../services/profesionalesCheckin";
import { prepararNavegacionCheckIn } from "../services/prepararNavegacionCheckIn";
import {
  normalizarDocumentoCkin,
  buscarPacienteCheckin,
  validarCheckInExistente,
} from "../config/validarCedulaCkin";

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

  // =========================================================
  // ESTADOS PRINCIPALES DEL CHECK-IN
  // =========================================================
  const [formData, setFormData] = useState(initialForm);
  const [paciente, setPaciente] = useState(null);
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  const [errores, setErrores] = useState({});
  const [advertenciaImagenMostrada, setAdvertenciaImagenMostrada] =
    useState(false);
  const [profesionales, setProfesionales] = useState([]);

  // =========================================================
  // SESIÓN DEL PROFESIONAL
  // =========================================================
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

  // Guarda en sessionStorage el profesional cuando llega por navegación
  useEffect(() => {
    if (location.state?.profesional) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(location.state.profesional),
      );
    }
  }, [location.state]);

  // Si no hay profesional, no puede usar herramientas
  useEffect(() => {
    if (!profesional) {
      alertError(
        "Acceso restringido",
        "Debes ingresar tu cédula para acceder a las herramientas.",
      );
      navigate("/", { replace: true });
    }
  }, [profesional, navigate]);

  // =========================================================
  // CARGA DE PROFESIONALES / INSTRUCTORES
  // =========================================================
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

  // =========================================================
  // LIMPIEZA DEL FLUJO SI NO ACEPTA POLÍTICA DE IMAGEN
  // =========================================================
  function limpiarProcesoPorNoAutorizacion() {
    setFormData(initialForm);
    setPaciente(null);
    setErrores({});
    setAdvertenciaImagenMostrada(false);
  }

  // =========================================================
  // MANEJO DE CAMBIOS DEL FORMULARIO
  // =========================================================
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

    // Si cambia la cédula, se invalida el paciente cargado
    if (name === "cedula") {
      setPaciente(null);
      setErrores((prev) => ({
        ...prev,
        paciente: "",
      }));
    }

    // Si ahora sí acepta imagen, quitamos la advertencia previa
    if (name === "autorizacionImagen" && value === "si") {
      setAdvertenciaImagenMostrada(false);
    }
  }

  // =========================================================
  // VALIDACIÓN BASE ANTES DE CONTINUAR
  // =========================================================
  function validarFormularioBase() {
    const nuevosErrores = {};
    const documentoNormalizado = normalizarDocumentoCkin(formData.cedula);

    if (!documentoNormalizado) {
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

  // =========================================================
  // BÚSQUEDA Y VALIDACIÓN DEL PACIENTE EN PARTICIPANTES
  // =========================================================
  async function handleBuscarPaciente() {
    const documentoIngresado = normalizarDocumentoCkin(formData.cedula);

    if (!documentoIngresado) {
      setErrores((prev) => ({
        ...prev,
        cedula: "Ingresa el número de documento para validar al paciente.",
      }));
      return;
    }

    try {
      setLoadingBusqueda(true);
      setPaciente(null);

      // La búsqueda real ahora se hace desde la utilidad centralizada.
      // Allí mismo se normaliza la cédula, se consulta Supabase
      // y se dejan logs claros en consola cuando no encuentre coincidencia.
      const { pacienteEncontrado, documentoNormalizado, error } =
        await buscarPacienteCheckin(formData.cedula);

      if (error) {
        throw error;
      }

      console.log("Paciente encontrado:", pacienteEncontrado);

      if (!pacienteEncontrado) {
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

      setPaciente(pacienteEncontrado);

      setFormData((prev) => ({
        ...prev,
        cedula: documentoNormalizado,
      }));

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
        error.message ||
          "Ocurrió un error al consultar la información del paciente.",
      );
    } finally {
      setLoadingBusqueda(false);
    }
  }

  // =========================================================
  // CONTINUAR EL FLUJO DE CHECK-IN
  // =========================================================
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

    // Primera advertencia si no acepta política de imagen
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

    // Segunda confirmación si insiste en no aceptar imagen
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
      // 🔴 Verifica si el paciente ya tiene un check-in registrado.
      // Si ya existe, se bloquea el proceso y se muestra la alerta.
      const { yaExiste, error: errorCheckinExistente } =
        await validarCheckInExistente(formData.cedula);

      if (errorCheckinExistente) {
        throw errorCheckinExistente;
      }

      if (yaExiste) {
        await alertError(
          "Check-in ya registrado",
          "El paciente ya realizó el proceso de check-in.",
        );
        return;
      }

      const mode = getCheckinUploadMode();

      // -----------------------------------------------------
      // 1) Armado del payload base de check-in
      // -----------------------------------------------------
      const checkInPayload = {
        cedula: normalizarDocumentoCkin(formData.cedula),
        instructor: formData.instructor.trim(),
        lugarValoracion: formData.lugarValoracion.trim(),
        habeasData: formData.habeasData === "si",
        autorizacionImagen: formData.autorizacionImagen === "si",
        seguridadSocial: formData.seguridadSocial,
      };

      // -----------------------------------------------------
      // 2) Guardado real o simulación
      // -----------------------------------------------------
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

      // -----------------------------------------------------
      // 3) Preparar navegación enriquecida
      // -----------------------------------------------------
      const navigationState = await prepararNavegacionCheckIn({
        paciente,
        profesional,
        checkInPayload,
      });

      console.log("Clasificación preparada desde check-in:", {
        esPacienteNuevo:
          navigationState?.clasificacionPaciente?.esPacienteNuevo,
        esPacienteAntiguo:
          navigationState?.clasificacionPaciente?.esPacienteAntiguo,
        flujo: navigationState?.clasificacionPaciente?.flujo,
        clasificacionPaciente: navigationState?.clasificacionPaciente,
      });

      // -----------------------------------------------------
      // 4) Navegar a valoración con etiqueta de nuevo/antiguo
      // -----------------------------------------------------
      navigate("/herramientas/valoracion", {
        state: navigationState,
      });
    } catch (error) {
      console.error("Error guardando check-in:", error);

      await alertError(
        "Error al guardar check-in",
        error?.message || "No fue posible guardar la información del check-in.",
      );
    }
  }

  // =========================================================
  // CIERRE DE SESIÓN
  // =========================================================
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

  // =========================================================
  // VOLVER
  // =========================================================
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
