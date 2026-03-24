import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { iniciarValoracionActiva } from "../utils/valoracionSession";
import { buscarClasificacionPaciente } from "../services/buscarClasificacionPaciente";
import ValoracionContent from "../components/ValoracionContent";

import { supabase } from "../../../shared/lib/supabaseClient";
import { alertConfirm, alertError, alertOk } from "../../../shared/lib/alerts";
import BotonImportante from "../../../shared/components/BotonImportante/BotonImportante";

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

function crearFormularioEdicion(paciente) {
  return {
    nombre_apellido_documento: paciente?.nombre_apellido_documento || "",
    genero: paciente?.genero || "",
    numero_telefono: paciente?.numero_telefono || "",
    fecha_nacimiento: paciente?.fecha_nacimiento || "",
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

  const [mostrarEditor, setMostrarEditor] = useState(false);
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
      if (paciente?.clasificacionPaciente) return;

      try {
        setLoading(true);

        const documento = pacienteDesdeCheckIn.numero_documento_fisico;
        const clasificacionPaciente =
          await buscarClasificacionPaciente(documento);

        const estadoCalidad =
          construirEstadoCalidadPaciente(pacienteDesdeCheckIn);

        setPaciente({
          ...pacienteDesdeCheckIn,
          clasificacionPaciente,
          estadoCalidad,
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
      setMostrarEditor(false);

      const documento = cedula.trim();

      const { data, error } = await supabase
        .from("participantes")
        .select(
          "numero_documento_fisico, nombre_apellido_documento, numero_telefono, genero, fecha_nacimiento",
        )
        .eq("numero_documento_fisico", documento)
        .single();

      if (error || !data) {
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

  function handleAbrirEditor() {
    if (!paciente) return;

    setFormEdicion(crearFormularioEdicion(paciente));
    setMostrarEditor(true);
  }

  function handleCerrarEditor() {
    setMostrarEditor(false);
  }

  function handleChangeEdicion(e) {
    const { name, value } = e.target;

    setFormEdicion((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleGuardarEdicionTemporal() {
    if (!paciente?.numero_documento_fisico) {
      await alertError(
        "Paciente no válido",
        "No se encontró un paciente válido para actualizar.",
      );
      return;
    }

    const nombre = String(formEdicion.nombre_apellido_documento || "").trim();
    const genero = String(formEdicion.genero || "").trim();
    const telefono = String(formEdicion.numero_telefono || "").trim();
    const fechaNacimiento = String(formEdicion.fecha_nacimiento || "").trim();

    if (!nombre) {
      await alertError("Dato requerido", "El nombre no puede quedar vacío.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        nombre_apellido_documento: nombre,
        genero: genero || null,
        numero_telefono: telefono || null,
        fecha_nacimiento: fechaNacimiento || null,
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

      setMostrarEditor(false);

      await alertOk(
        "Datos actualizados",
        "Los datos del paciente fueron actualizados correctamente en la base de datos.",
      );
    } catch (error) {
      console.error("Error actualizando paciente:", error);

      await alertError(
        "Error al guardar",
        error.message || "No se pudieron actualizar los datos del paciente.",
      );
    } finally {
      setLoading(false);
    }
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
        onEditarDatos={handleAbrirEditor}
      />

      {mostrarEditor && (
        <div className="editorPacienteOverlay">
          <div className="editorPacienteModal">
            <div className="editorPacienteHeader">
              <h3 className="editorPacienteTitle">Editar datos del paciente</h3>
              <p className="editorPacienteSubtitle">
                Solo puedes modificar nombre, género, teléfono y fecha de
                nacimiento.
              </p>
            </div>

            <div className="editorPacienteForm">
              <div className="editorPacienteField">
                <label className="editorPacienteLabel">Nombre</label>
                <input
                  className="editorPacienteInput"
                  type="text"
                  name="nombre_apellido_documento"
                  value={formEdicion.nombre_apellido_documento}
                  onChange={handleChangeEdicion}
                />
              </div>

              <div className="editorPacienteField">
                <label className="editorPacienteLabel">Género</label>
                <select
                  className="editorPacienteInput"
                  name="genero"
                  value={formEdicion.genero}
                  onChange={handleChangeEdicion}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Indeterminado">Indeterminado</option>
                  <option value="Prefiero no responder">
                    Prefiero no responder
                  </option>
                </select>
              </div>

              <div className="editorPacienteField">
                <label className="editorPacienteLabel">Teléfono</label>
                <input
                  className="editorPacienteInput"
                  type="text"
                  name="numero_telefono"
                  value={formEdicion.numero_telefono}
                  onChange={handleChangeEdicion}
                />
              </div>

              <div className="editorPacienteField">
                <label className="editorPacienteLabel">
                  Fecha de nacimiento
                </label>
                <input
                  className="editorPacienteInput"
                  type="date"
                  name="fecha_nacimiento"
                  value={formEdicion.fecha_nacimiento || ""}
                  onChange={handleChangeEdicion}
                />
              </div>
            </div>

            <div className="editorPacienteActions">
              <BotonImportante
                type="button"
                variant="ghost"
                onClick={handleCerrarEditor}
              >
                Cancelar
              </BotonImportante>

              <BotonImportante
                type="button"
                onClick={handleGuardarEdicionTemporal}
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar cambios"}
              </BotonImportante>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
