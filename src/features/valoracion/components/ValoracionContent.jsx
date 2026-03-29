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
  const estadoPrec =
    paciente?.clasificacionPaciente?.estadoPreclasificacion ?? null;
  const estadoPreclasificacion = estadoPrec || "Sin dato";

  const claseAlerta = paciente?.clasificacionPaciente?.preclasifica
    ? "valoracionStatusAlert valoracionStatusAlert--ok"
    : estadoPrec === "Se sugiere nuevo análisis" ||
        estadoPrec === "Paciente nuevo"
      ? "valoracionStatusAlert valoracionStatusAlert--info"
      : "valoracionStatusAlert valoracionStatusAlert--warn";

  const mensajeAlerta =
    paciente?.clasificacionPaciente?.mensajePreclasificacion ||
    "No se pudo determinar el estado de preclasificación.";

  const cp = paciente?.clasificacionPaciente;
  /** Nota visible siempre que haya fila en asistencia (no solo cuando la zona sale solo de ahí). */
  const mostrarNotaPrioridadAsistencia = Boolean(cp?.asistenciaEncontrada);
  const textoPrioridadAsistencia =
    "El sistema dará prioridad a la clasificación registrada en la tabla de asistencias.";

  const encuestaLogrosResumen = cp
    ? `${cp.encuestaLogrosRealizada ? "Sí" : "No"} (${cp.encuestaLogrosEstado || "Sin dato"})`
    : "—";

  const preliminarValoracionEtiqueta = cp?.personaNoValoradaFisioterapia
    ? "(Persona no valorada en valoraciones_fisioterapia)"
    : cp?.clasificacionPreliminarDesdeBd || "—";

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
                </div>
              )}

              <div className="valoracionActions">
                <BotonImportante
                  type="button"
                  variant="ghost"
                  onClick={onEditarDatos}
                >
                  ✏️ Editar datos del paciente
                </BotonImportante>

                <BotonImportante type="button" onClick={onContinuar}>
                  Continuar a anamnesis global
                </BotonImportante>
              </div>

              <div className={claseAlerta}>
                <h3 className="valoracionStatusTitle">
                  Estado de preclasificación: {estadoPreclasificacion}
                </h3>

                <p className="valoracionStatusText valoracionPrecLead">
                  {mensajeAlerta}
                </p>

                <div className="valoracionPrecDetalle valoracionPrecBloqueResumen">
                  <p>
                    <strong>Hizo parte MMB 2025:</strong>{" "}
                    {cp?.hizoParteMmb2025 ? "Sí" : "No"}
                  </p>

                  <p>
                    <strong>Registro valoración fisioterapia 2025:</strong>{" "}
                    {cp?.valoracionEncontrada ? "Sí" : "No"}
                  </p>

                  <p>
                    <strong>Registro asistencia 2025:</strong>{" "}
                    {cp?.asistenciaEncontrada ? "Sí" : "No"}
                  </p>

                  {cp?.asistenciaEncontrada ? (
                    <p>
                      <strong>Asistencia:</strong>{" "}
                      {`(${cp.asistencias}/${cp.totalDias})`}
                      {cp.cumpleAsistencia ? (
                        <span>
                          {" "}
                          (cumple mínimo de {cp.umbralAsistencias} asistencias)
                        </span>
                      ) : (
                        <span>
                          {" "}
                          — no supera el mínimo de {cp.umbralAsistencias}{" "}
                          asistencias
                        </span>
                      )}
                    </p>
                  ) : null}

                  <p>
                    <strong>Encuesta de logros:</strong> {encuestaLogrosResumen}
                  </p>
                </div>

                <div className="valoracionPrecDetalle valoracionPrecSeccionClasif">
                  <p>
                    <strong>Clasificación preliminar (valoración fisioterapia):</strong>{" "}
                    {preliminarValoracionEtiqueta}
                  </p>

                  <p>
                    <strong>Patología relacionada (asistencia):</strong>{" "}
                    {cp?.patologiaRelacionadaDesdeAsistencia || "—"}
                  </p>

                  <p>
                    <strong>Clasificación secundaria (BD):</strong>{" "}
                    {cp?.clasificacionSecundariaDesdeBd || "—"}
                  </p>

                  {mostrarNotaPrioridadAsistencia ? (
                    <p className="valoracionPriorityNote">
                      {textoPrioridadAsistencia}
                    </p>
                  ) : null}
                </div>
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
