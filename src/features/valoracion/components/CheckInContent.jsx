import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import logoWakeup from "../../../assets/LogoWakeup.png";
import ValoracionStepper from "./ValoracionStepper";

import "./CheckInContent.css";

export default function CheckInContent({
  userName,
  formData,
  errores,
  paciente,
  pacienteEncontrado,
  loadingBusqueda,
  onChange,
  onBuscarPaciente,
  onContinuar,
  onVolver,
  onLogout,
}) {
  return (
    <div className="checkinShell">
      <TopHeader userName={userName} onLogout={onLogout} logoSrc={logoWakeup} />

      <main className="checkinPage">
        <div className="checkinTopActions">
          <button className="checkinBackBtn" onClick={onVolver} type="button">
            ← Volver
          </button>
        </div>

        <section className="checkinHero">
          <h1 className="checkinTitle">Anamnesis</h1>
          <p className="checkinSubtitle">Clasificación del paciente</p>
        </section>

        <ValoracionStepper currentStep={1} />

        <section className="checkinCard">
          <div className="checkinCardHeader">
            <h2 className="checkinCardTitle">Check-in de ingreso</h2>
            <p className="checkinCardDescription">
              Registra la identificación inicial del paciente, valida su
              existencia en la base de datos y documenta las autorizaciones
              requeridas antes de iniciar la valoración.
            </p>
          </div>

          <form className="checkinForm" onSubmit={onContinuar}>
            <section className="checkinSection">
              <h3 className="checkinSectionTitle">1. Identificación inicial</h3>

              <div className="checkinGrid">
                <div className="checkinField">
                  <label className="checkinLabel" htmlFor="cedula">
                    Número de documento
                  </label>
                  <input
                    id="cedula"
                    className="checkinInput"
                    type="text"
                    name="cedula"
                    value={formData.cedula}
                    onChange={onChange}
                    placeholder="Ingresa la cédula del paciente"
                  />
                  {errores.cedula ? (
                    <span className="checkinError">{errores.cedula}</span>
                  ) : null}
                </div>

                <div className="checkinField">
                  <label className="checkinLabel" htmlFor="instructor">
                    Profesional o instructor responsable
                  </label>
                  <input
                    id="instructor"
                    className="checkinInput"
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={onChange}
                    placeholder="Nombre del responsable"
                  />
                  {errores.instructor ? (
                    <span className="checkinError">{errores.instructor}</span>
                  ) : null}
                </div>

                <div className="checkinField checkinField--full">
                  <label className="checkinLabel" htmlFor="lugarValoracion">
                    Lugar de valoración
                  </label>
                  <input
                    id="lugarValoracion"
                    className="checkinInput"
                    type="text"
                    name="lugarValoracion"
                    value={formData.lugarValoracion}
                    onChange={onChange}
                    placeholder="Ej. Barranquilla - sede principal"
                  />
                  {errores.lugarValoracion ? (
                    <span className="checkinError">
                      {errores.lugarValoracion}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="checkinSearchActions">
                <button
                  type="button"
                  className="checkinPrimaryButton"
                  onClick={onBuscarPaciente}
                  disabled={loadingBusqueda}
                >
                  {loadingBusqueda ? "Buscando..." : "Validar paciente"}
                </button>
              </div>

              <div
                className={`checkinPatientStatus ${
                  pacienteEncontrado
                    ? "checkinPatientStatus--ok"
                    : "checkinPatientStatus--warning"
                }`}
              >
                {pacienteEncontrado ? (
                  <>
                    <h4 className="checkinPatientStatusTitle">
                      Paciente encontrado en base de datos
                    </h4>

                    <div className="checkinPatientGrid">
                      <div className="checkinPatientItem">
                        <span className="checkinPatientLabel">Nombre</span>
                        <strong className="checkinPatientValue">
                          {paciente?.nombre_apellido_documento ||
                            "Sin registro"}
                        </strong>
                      </div>

                      <div className="checkinPatientItem">
                        <span className="checkinPatientLabel">Teléfono</span>
                        <strong className="checkinPatientValue">
                          {paciente?.numero_telefono || "Sin registro"}
                        </strong>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="checkinPatientStatusTitle">
                      Paciente pendiente de validación
                    </h4>
                    <p className="checkinPatientStatusText">
                      Debes validar que el paciente exista en la base de datos
                      antes de continuar con el proceso.
                    </p>
                  </>
                )}
              </div>

              {errores.paciente ? (
                <span className="checkinError">{errores.paciente}</span>
              ) : null}
            </section>

            <section className="checkinSection">
              <h3 className="checkinSectionTitle">
                2. Autorización para tratamiento de datos personales
              </h3>

              <div className="checkinInfoBox">
                <p>
                  Declaro de manera libre, previa, expresa e informada que
                  autorizo a{" "}
                  <strong>Wakeup Rehabilitación Funcional S.A.S.</strong> y al
                  programa{" "}
                  <strong>“Muévete Mejor, Barranquilla a otro nivel”</strong>{" "}
                  para realizar la recolección, almacenamiento, uso,
                  circulación, supresión y, en general, el tratamiento de mis
                  datos personales, con fines relacionados con la atención,
                  valoración funcional, seguimiento clínico, gestión
                  administrativa y actividades asociadas al desarrollo del
                  programa.
                </p>

                <p>
                  Declaro que he sido informado(a) de manera clara y
                  comprensible sobre mis derechos a conocer, actualizar,
                  rectificar y suprimir mis datos personales, solicitar prueba
                  de esta autorización, conocer el uso dado a la información
                  suministrada, revocar la autorización cuando sea procedente y
                  acceder de manera gratuita a mis datos personales.
                </p>
              </div>

              <div className="checkinField">
                <label className="checkinLabel">¿Autoriza Habeas Data?</label>

                <div className="checkinRadioGroup">
                  <label className="checkinRadioOption">
                    <input
                      type="radio"
                      name="habeasData"
                      value="si"
                      checked={formData.habeasData === "si"}
                      onChange={onChange}
                    />
                    Sí
                  </label>

                  <label className="checkinRadioOption">
                    <input
                      type="radio"
                      name="habeasData"
                      value="no"
                      checked={formData.habeasData === "no"}
                      onChange={onChange}
                    />
                    No
                  </label>
                </div>

                {errores.habeasData ? (
                  <span className="checkinError">{errores.habeasData}</span>
                ) : null}
              </div>
            </section>

            <section className="checkinSection">
              <h3 className="checkinSectionTitle">3. Autorización de imagen</h3>

              <div className="checkinInfoBox">
                <p>
                  Autorizo de manera libre, previa, expresa e informada a{" "}
                  <strong>Wakeup Rehabilitación Funcional S.A.S.</strong> y al
                  programa{" "}
                  <strong>“Muévete Mejor, Barranquilla a otro nivel”</strong>{" "}
                  para el uso de mi imagen en fotografías y/o videos con fines
                  educativos, científicos, institucionales, promocionales y de
                  divulgación del programa.
                </p>

                <p>
                  Esta autorización comprende su uso en medios digitales,
                  material impreso, página web y redes sociales institucionales,
                  siempre que dicho uso esté relacionado con las actividades
                  propias del programa. Entiendo que esta autorización no genera
                  compensación económica y que el uso de mi imagen deberá
                  respetar mi dignidad, confidencialidad e integridad.
                </p>
              </div>

              <div className="checkinField">
                <label className="checkinLabel">
                  ¿Autoriza el uso de imagen?
                </label>

                <div className="checkinRadioGroup">
                  <label className="checkinRadioOption">
                    <input
                      type="radio"
                      name="autorizacionImagen"
                      value="si"
                      checked={formData.autorizacionImagen === "si"}
                      onChange={onChange}
                    />
                    Sí
                  </label>

                  <label className="checkinRadioOption">
                    <input
                      type="radio"
                      name="autorizacionImagen"
                      value="no"
                      checked={formData.autorizacionImagen === "no"}
                      onChange={onChange}
                    />
                    No
                  </label>
                </div>

                {errores.autorizacionImagen ? (
                  <span className="checkinError">
                    {errores.autorizacionImagen}
                  </span>
                ) : null}
              </div>
            </section>

            <section className="checkinSection">
              <h3 className="checkinSectionTitle">
                4. Información de aseguramiento en salud
              </h3>

              <div className="checkinField">
                <label className="checkinLabel" htmlFor="seguridadSocial">
                  Tipo de seguridad social
                </label>

                <select
                  id="seguridadSocial"
                  className="checkinInput"
                  name="seguridadSocial"
                  value={formData.seguridadSocial}
                  onChange={onChange}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="subsidiado">Subsidiado</option>
                  <option value="contributivo">Contributivo</option>
                  <option value="medicina_prepagada">Medicina prepagada</option>
                </select>

                {errores.seguridadSocial ? (
                  <span className="checkinError">
                    {errores.seguridadSocial}
                  </span>
                ) : null}
              </div>
            </section>

            <div className="checkinFooterActions">
              <button
                type="button"
                className="checkinSecondaryButton"
                onClick={onVolver}
              >
                Volver
              </button>

              <button type="submit" className="checkinPrimaryButton">
                Continuar a datos generales
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
