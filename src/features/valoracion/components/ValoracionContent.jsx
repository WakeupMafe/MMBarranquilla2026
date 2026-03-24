import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import logoWakeup from "../../../assets/LogoWakeup.png";
import ValoracionStepper from "./ValoracionStepper";
import BotonImportante from "../../../shared/components/BotonImportante/BotonImportante";

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
  onEditarDatos,
}) {
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
      <TopHeader userName={userName} onLogout={onLogout} logoSrc={logoWakeup} />

      <main className="valoracionPage">
        <div className="valoracionTopActions">
          <BotonImportante type="button" variant="ghost" onClick={onVolver}>
            ← Volver
          </BotonImportante>
        </div>

        <section className="valoracionHero">
          <h1 className="valoracionTitle">Datos generales del paciente</h1>
          <p className="valoracionSubtitle">
            Validación clínica inicial y clasificación previa al
            diligenciamiento de la anamnesis.
          </p>
        </section>

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

          {!vieneDesdeCheckIn && (
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

                <BotonImportante type="submit" disabled={loading}>
                  {loading ? "Buscando..." : "Buscar paciente"}
                </BotonImportante>
              </form>

              <div className="valoracionDivider" />
            </>
          )}

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

                  <div className="valoracionPatientItem">
                    <span className="valoracionPatientLabel">
                      Fecha de nacimiento
                    </span>
                    <strong className="valoracionPatientValue">
                      {paciente.fecha_nacimiento || "-"}
                    </strong>
                  </div>
                </div>
              </div>

              {paciente?.estadoCalidad?.requiereCorreccion && (
                <div className="valoracionStatusAlert valoracionStatusAlert--warn">
                  <h3 className="valoracionStatusTitle">
                    Este paciente necesita corrección de datos
                  </h3>

                  <p className="valoracionStatusText">
                    Se encontraron campos incompletos o inconsistentes.
                  </p>

                  <ul className="anamnesisInlineList">
                    {paciente.estadoCalidad.problemas.map((problema) => (
                      <li key={problema}>{problema}</li>
                    ))}
                  </ul>

                  <div className="valoracionActions">
                    <BotonImportante type="button" onClick={onEditarDatos}>
                      ✏️ Editar datos
                    </BotonImportante>
                  </div>
                </div>
              )}

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
                <BotonImportante type="button" onClick={onContinuar}>
                  Continuar a anamnesis global
                </BotonImportante>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
