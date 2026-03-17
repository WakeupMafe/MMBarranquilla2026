import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import logoWakeup from "../../../assets/LogoWakeup.png";

import { supabase } from "../../../shared/lib/supabaseClient";
import { alertConfirm, alertError, alertOk } from "../../../shared/lib/alerts";
import { buscarClasificacionPaciente } from "../services/buscarClasificacionPaciente";

import "./Valoracion.css";

const SESSION_KEY = "wk_profesional";

export default function Valoracion() {
  const navigate = useNavigate();
  const location = useLocation();

  const [cedula, setCedula] = useState("");
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

  async function handleBuscar(e) {
    e.preventDefault();

    if (!cedula.trim()) {
      alertError("Falta información", "Debes ingresar una cédula");
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

        alertError(
          "Paciente no encontrado",
          "No existe un paciente con esa cédula en la base de datos",
        );

        return;
      }

      const clasificacionPaciente =
        await buscarClasificacionPaciente(documento);

      console.log("clasificacionPaciente", clasificacionPaciente);

      setPaciente({
        ...data,
        clasificacionPaciente,
      });
    } catch (err) {
      console.error(err);

      alertError(
        "Error de consulta",
        err.message || "No se pudo consultar el paciente",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleContinuar() {
    if (!paciente?.clasificacionPaciente) return;

    const destino = paciente.clasificacionPaciente.preclasifica
      ? "/herramientas/anamnesis-zona"
      : "/herramientas/anamnesis-global";

    navigate(destino, {
      state: {
        profesional,
        paciente,
      },
    });
  }

  const handleLogout = async () => {
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
  };

  if (!profesional) return null;

  const userName = profesional.nombre;

  const estadoPreclasificacion =
    paciente?.clasificacionPaciente?.estadoPreclasificacion || "Sin dato";

  const claseAlerta = paciente?.clasificacionPaciente?.preclasifica
    ? "valoracionStatusAlert valoracionStatusAlert--ok"
    : paciente?.clasificacionPaciente?.estadoPreclasificacion ===
        "Se sugiere nuevo análisis"
      ? "valoracionStatusAlert valoracionStatusAlert--info"
      : "valoracionStatusAlert valoracionStatusAlert--warn";

  const mensajeAlerta =
    paciente?.clasificacionPaciente?.mensajePreclasificacion ||
    "No se pudo determinar el estado de preclasificación.";

  return (
    <div className="valoracionShell">
      <TopHeader
        userName={userName}
        onLogout={handleLogout}
        logoSrc={logoWakeup}
      />

      <main className="valoracionPage">
        <div className="valoracionTopActions">
          <button
            className="valoracionBackBtn"
            onClick={() => navigate("/herramientas")}
          >
            ← Volver
          </button>
        </div>

        <section className="valoracionHero">
          <h1 className="valoracionTitle">Anamnesis</h1>
          <p className="valoracionSubtitle">Clasificación del paciente</p>
        </section>

        <section className="valoracionStepper" aria-label="Progreso">
          <div className="stepItem stepItem--active">
            <span className="stepNumber">1</span>
            <span className="stepText">Datos generales</span>
          </div>

          <div className="stepItem">
            <span className="stepNumber">2</span>
            <span className="stepText">Anamnesis global</span>
          </div>

          <div className="stepItem">
            <span className="stepNumber">3</span>
            <span className="stepText">Detección de dolor</span>
          </div>

          <div className="stepItem">
            <span className="stepNumber">4</span>
            <span className="stepText">Clasificación preliminar</span>
          </div>
        </section>

        <section className="valoracionCard">
          <div className="valoracionCardHeader">
            <h2 className="valoracionCardTitle">Buscar paciente</h2>

            <p className="valoracionCardDescription">
              Ingresa la cédula para validar si el paciente pasa a anamnesis
              global o a anamnesis por zona.
            </p>
          </div>

          <form className="valoracionForm" onSubmit={handleBuscar}>
            <div className="valoracionField">
              <label htmlFor="cedula" className="valoracionLabel">
                Cédula del paciente
              </label>

              <input
                id="cedula"
                className="valoracionInput"
                type="text"
                placeholder="Ingrese la cédula"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
              />
            </div>

            <div className="valoracionActions">
              <button
                className="valoracionPrimaryBtn"
                type="submit"
                disabled={loading}
              >
                {loading ? "Buscando..." : "Buscar paciente"}
              </button>
            </div>
          </form>

          <div className="valoracionResultBox">
            {!paciente && (
              <p className="valoracionResultPlaceholder">
                Aquí aparecerá el resultado de la búsqueda del paciente.
              </p>
            )}

            {paciente && (
              <div className="valoracionPacienteCard">
                <div className={claseAlerta}>
                  <strong>{mensajeAlerta}</strong>
                </div>

                <h3>Paciente encontrado</h3>

                <ul className="valoracionPacienteList">
                  <li>
                    <strong>Nombre:</strong>{" "}
                    {paciente.nombre_apellido_documento}
                  </li>

                  <li>
                    <strong>Cédula:</strong> {paciente.numero_documento_fisico}
                  </li>

                  <li>
                    <strong>Teléfono:</strong>{" "}
                    {paciente.numero_telefono || "Sin dato"}
                  </li>

                  <li>
                    <strong>Género:</strong> {paciente.genero || "Sin dato"}
                  </li>

                  <li>
                    <strong>Hizo parte MMB 2025:</strong>{" "}
                    {paciente.clasificacionPaciente?.hizoParteMmb2025
                      ? "Sí"
                      : "No"}
                  </li>

                  <li>
                    <strong>Preclasificación:</strong> {estadoPreclasificacion}
                  </li>

                  <li>
                    <strong>Patología 2025:</strong>{" "}
                    {paciente.clasificacionPaciente?.clasificacionPreliminar ||
                      "Sin dato"}
                  </li>

                  <li>
                    <strong>Clasificación Final:</strong>{" "}
                    {paciente.clasificacionPaciente?.clasificacionFinal ||
                      "Sin dato"}
                  </li>

                  <li>
                    <strong>Asistencia:</strong>{" "}
                    {paciente.clasificacionPaciente?.porcentajeAsistencia ??
                      "Sin dato"}
                    %
                  </li>

                  <li>
                    <strong>Logros:</strong>{" "}
                    {paciente.clasificacionPaciente?.encuestaLogrosEstado ||
                      "Sin dato"}
                  </li>

                  <li>
                    <strong>Tipo de anamnesis:</strong>{" "}
                    {paciente.clasificacionPaciente?.tipoAnamnesis ||
                      "Sin dato"}
                  </li>
                </ul>

                <div className="valoracionActions valoracionActions--result">
                  <button
                    className="valoracionPrimaryBtn"
                    type="button"
                    onClick={handleContinuar}
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
