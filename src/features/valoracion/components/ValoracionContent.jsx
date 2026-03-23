import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import logoWakeup from "../../../assets/LogoWakeup.png";
import ValoracionStepper from "./ValoracionStepper";

import "./ValoracionContent.css";

export default function ValoracionContent({
  userName,
  vieneDesdeCheckIn,
  cedula,
  setCedula,
  loading,
  paciente,
  onBuscar,
  onContinuar,
  onLogout,
  onVolver,
}) {
  const estadoPreclasificacion =
    paciente?.clasificacionPaciente?.estadoPreclasificacion || "Sin dato";

  const claseAlerta = paciente?.esSimulacro
    ? "valoracionStatusAlert valoracionStatusAlert--info"
    : paciente?.clasificacionPaciente?.preclasifica
      ? "valoracionStatusAlert valoracionStatusAlert--ok"
      : paciente?.clasificacionPaciente?.estadoPreclasificacion ===
            "Se sugiere nuevo análisis" ||
          paciente?.clasificacionPaciente?.estadoPreclasificacion ===
            "Simulacro activo"
        ? "valoracionStatusAlert valoracionStatusAlert--info"
        : "valoracionStatusAlert valoracionStatusAlert--warn";

  const mensajeAlerta =
    paciente?.clasificacionPaciente?.mensajePreclasificacion ||
    "No se pudo determinar el estado de preclasificación.";

  return (
    <div className="valoracionShell">
      <TopHeader userName={userName} onLogout={onLogout} logoSrc={logoWakeup} />

      <main className="valoracionPage">
        <div className="valoracionTopActions">
          <button
            className="valoracionBackBtn"
            onClick={onVolver}
            type="button"
          >
            ← Volver
          </button>
        </div>

        <section className="valoracionHero">
          <h1 className="valoracionTitle">Datos generales del paciente</h1>
          <p className="valoracionSubtitle">
            Validación clínica inicial y clasificación previa al
            diligenciamiento de la anamnesis.
          </p>
        </section>

        {/* 🔥 STEP PER CENTRALIZADO */}
        <ValoracionStepper currentStep={2} />

        <section className="valoracionCard">
          <div className="valoracionCardHeader">
            <h2 className="valoracionCardTitle">
              {vieneDesdeCheckIn
                ? "Paciente validado"
                : "Validación del paciente"}
            </h2>

            <p className="valoracionCardDescription">
              {vieneDesdeCheckIn
                ? "El paciente fue validado previamente durante el check-in. Revisa la información general y continúa con el proceso."
                : "Ingresa la cédula del paciente para consultar su información y determinar el flujo de valoración correspondiente."}
            </p>
          </div>

          {!vieneDesdeCheckIn ? (
            <>
              <form className="valoracionForm" onSubmit={onBuscar}>
                <label className="valoracionLabel" htmlFor="cedulaPaciente">
                  Cédula del paciente
                </label>

                <input
                  id="cedulaPaciente"
                  className="valoracionInput"
                  type="text"
                  placeholder="Ingresa la cédula"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  disabled={loading}
                />

                <button
                  type="submit"
                  className="valoracionPrimaryButton"
                  disabled={loading}
                >
                  {loading ? "Buscando..." : "Buscar paciente"}
                </button>
              </form>

              <div className="valoracionDivider" />
            </>
          ) : null}

          {!paciente ? (
            <p className="valoracionEmptyState">
              Aquí aparecerá la información general del paciente una vez sea
              validado.
            </p>
          ) : (
            <div className="valoracionResultBlock">
              <div className="valoracionPatientCard">
                <h3 className="valoracionPatientTitle">
                  Información general del paciente
                </h3>

                <div className="valoracionPatientGrid">
                  <div className="valoracionPatientItem">
                    <span className="valoracionPatientLabel">Documento</span>
                    <strong className="valoracionPatientValue">
                      {paciente.numero_documento_fisico || "-"}
                    </strong>
                  </div>

                  <div className="valoracionPatientItem">
                    <span className="valoracionPatientLabel">Nombre</span>
                    <strong className="valoracionPatientValue">
                      {paciente.nombre_apellido_documento || "-"}
                    </strong>
                  </div>

                  <div className="valoracionPatientItem">
                    <span className="valoracionPatientLabel">Teléfono</span>
                    <strong className="valoracionPatientValue">
                      {paciente.numero_telefono || "-"}
                    </strong>
                  </div>

                  <div className="valoracionPatientItem">
                    <span className="valoracionPatientLabel">Género</span>
                    <strong className="valoracionPatientValue">
                      {paciente.genero || "-"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className={claseAlerta}>
                <h3 className="valoracionStatusTitle">
                  Estado de preclasificación: {estadoPreclasificacion}
                </h3>

                <p className="valoracionStatusText">{mensajeAlerta}</p>

                <div style={{ marginTop: "10px", lineHeight: "1.6" }}>
                  <p>
                    <strong>Hizo parte MMB 2025:</strong>{" "}
                    {paciente?.clasificacionPaciente?.hizoParteMmb2025
                      ? "Sí"
                      : "No"}
                  </p>

                  <p>
                    <strong>Preclasificación:</strong>{" "}
                    {paciente?.clasificacionPaciente?.estadoPreclasificacion ||
                      "-"}
                  </p>

                  <p>
                    <strong>Patología 2025:</strong>{" "}
                    {paciente?.clasificacionPaciente?.clasificacionPreliminar ||
                      "-"}
                  </p>

                  <p>
                    <strong>Clasificación final:</strong>{" "}
                    {paciente?.clasificacionPaciente?.clasificacionFinal || "-"}
                  </p>

                  <p>
                    <strong>Asistencia:</strong>{" "}
                    {typeof paciente?.clasificacionPaciente
                      ?.porcentajeAsistencia === "number"
                      ? `${paciente.clasificacionPaciente.porcentajeAsistencia}%`
                      : "-"}
                  </p>

                  <p>
                    <strong>Logros:</strong>{" "}
                    {paciente?.clasificacionPaciente?.objetivosCumplidos
                      ? "Cumplió objetivos"
                      : "No cumplió objetivos"}
                  </p>

                  <p>
                    <strong>Tipo de anamnesis:</strong>{" "}
                    {paciente?.clasificacionPaciente?.tipoAnamnesis || "-"}
                  </p>
                </div>

                {paciente?.esSimulacro ? (
                  <p className="valoracionStatusMeta">
                    Este registro corresponde a un paciente de simulacro creado
                    para fines de prueba del flujo.
                  </p>
                ) : null}

                {paciente?.clasificacionPaciente?.clasificacionFinal ? (
                  <p className="valoracionStatusMeta">
                    <strong>Clasificación sugerida:</strong>{" "}
                    {paciente.clasificacionPaciente.clasificacionFinal}
                  </p>
                ) : null}

                {typeof paciente?.clasificacionPaciente
                  ?.porcentajeAsistencia === "number" ? (
                  <p className="valoracionStatusMeta">
                    <strong>Asistencia:</strong>{" "}
                    {paciente.clasificacionPaciente.porcentajeAsistencia}%
                  </p>
                ) : null}
              </div>

              <div className="valoracionActions">
                <button
                  type="button"
                  className="valoracionPrimaryButton"
                  onClick={onContinuar}
                >
                  Continuar a anamnesis global
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
