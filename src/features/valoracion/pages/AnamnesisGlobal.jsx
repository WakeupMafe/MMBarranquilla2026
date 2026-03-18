import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import logoWakeup from "../../../assets/LogoWakeup.png";
import { alertError } from "../../../shared/lib/alerts";

import { anamnesisGlobalInitialState } from "../config/anamnesisGlobalInitialState";
import {
  calcularImc,
  evaluarAnamnesisGlobal,
} from "../services/anamnesisGlobalRules";
import { validarAnamnesisGlobal } from "../services/validarAnamnesisGlobal";

import "./Valoracion.css";

export default function AnamnesisGlobal() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(anamnesisGlobalInitialState);
  const [resultado, setResultado] = useState(null);
  const [errores, setErrores] = useState({});

  const { imc, obesidad } = useMemo(() => {
    return calcularImc(formData.peso, formData.talla);
  }, [formData.peso, formData.talla]);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrores((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const nuevosErrores = validarAnamnesisGlobal(formData);

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      setResultado(null);

      alertError(
        "Formulario incompleto",
        "Debes responder todos los campos obligatorios antes de continuar.",
      );
      return;
    }

    const evaluacion = evaluarAnamnesisGlobal(formData);

    setErrores({});
    setResultado(evaluacion);

    console.log("formData", formData);
    console.log("evaluacionAnamnesisGlobal", evaluacion);
  }

  function renderError(name) {
    if (!errores[name]) return null;

    return <p className="valoracionFieldError">{errores[name]}</p>;
  }

  function renderSiNo(name, label) {
    return (
      <div className="valoracionField">
        <label className="valoracionLabel">{label}</label>

        <div className="valoracionRadioGroup">
          <label className="valoracionRadioOption">
            <input
              type="radio"
              name={name}
              value="SI"
              checked={formData[name] === "SI"}
              onChange={handleChange}
            />
            <span>Sí</span>
          </label>

          <label className="valoracionRadioOption">
            <input
              type="radio"
              name={name}
              value="NO"
              checked={formData[name] === "NO"}
              onChange={handleChange}
            />
            <span>No</span>
          </label>
        </div>

        {renderError(name)}
      </div>
    );
  }

  return (
    <div className="valoracionShell">
      <TopHeader
        userName="Profesional"
        onLogout={() => navigate("/")}
        logoSrc={logoWakeup}
      />

      <main className="valoracionPage">
        <div className="valoracionTopActions">
          <button
            className="valoracionBackBtn"
            onClick={() => navigate("/herramientas/valoracion")}
          >
            ← Volver
          </button>
        </div>

        <section className="valoracionHero">
          <h1 className="valoracionTitle">Anamnesis Global</h1>
          <p className="valoracionSubtitle">
            Paso 2. Evaluación clínica general del paciente
          </p>
        </section>

        <section className="valoracionStepper" aria-label="Progreso">
          <div className="stepItem">
            <span className="stepNumber">1</span>
            <span className="stepText">Datos generales</span>
          </div>

          <div className="stepItem stepItem--active">
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
            <h2 className="valoracionCardTitle">Formulario clínico</h2>
            <p className="valoracionCardDescription">
              Aunque exista algún criterio de descarte, el paciente debe
              completar todo el módulo.
            </p>
          </div>

          <form className="valoracionForm" onSubmit={handleSubmit}>
            <section className="anamnesisSection">
              <h3 className="anamnesisSectionTitle">4.1 Estilo de vida</h3>

              <div className="valoracionField">
                <label className="valoracionLabel">
                  ¿Cuántas horas duermes?
                </label>
                <input
                  className="valoracionInput"
                  type="number"
                  name="horas_sueno"
                  value={formData.horas_sueno}
                  onChange={handleChange}
                  placeholder="Ejemplo: 7"
                />
                {renderError("horas_sueno")}
              </div>

              <div className="valoracionField">
                <label className="valoracionLabel">
                  ¿Cuántas horas permaneces sentado o sentada?
                </label>
                <select
                  className="valoracionInput"
                  name="horas_sentado"
                  value={formData.horas_sentado}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="1-3">1 a 3</option>
                  <option value="4-7">4 a 7</option>
                  <option value=">7">Más de 7</option>
                </select>
                {renderError("horas_sentado")}
              </div>

              <div className="valoracionField">
                <label className="valoracionLabel">
                  ¿Cuántas horas te mueves al día?
                </label>
                <select
                  className="valoracionInput"
                  name="horas_movimiento"
                  value={formData.horas_movimiento}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="1-2">1 a 2</option>
                  <option value="3-5">3 a 5</option>
                  <option value="6-8">6 a 8</option>
                </select>
                {renderError("horas_movimiento")}
              </div>
            </section>

            <section className="anamnesisSection">
              <h3 className="anamnesisSectionTitle">
                4.2 Enfermedades metabólicas
              </h3>

              {renderSiNo("diabetes", "¿Tienes diabetes?")}
              {formData.diabetes === "SI" && (
                <>
                  {renderSiNo(
                    "diabetes_tratamiento",
                    "¿Tienes tratamiento para diabetes?",
                  )}
                </>
              )}

              {renderSiNo("hipertension", "¿Sufres de hipertensión?")}
              {formData.hipertension === "SI" && (
                <>
                  {renderSiNo(
                    "hipertension_tratamiento",
                    "¿Tienes tratamiento para hipertensión?",
                  )}
                </>
              )}

              {renderSiNo("colesterol_alto", "¿Sufres de colesterol alto?")}
              {formData.colesterol_alto === "SI" && (
                <>
                  {renderSiNo(
                    "colesterol_tratamiento",
                    "¿Tienes tratamiento para colesterol alto?",
                  )}
                </>
              )}
            </section>

            <section className="anamnesisSection">
              <h3 className="anamnesisSectionTitle">4.3 Obesidad</h3>

              <div className="anamnesisGrid">
                <div className="valoracionField">
                  <label className="valoracionLabel">Peso (kg)</label>
                  <input
                    className="valoracionInput"
                    type="number"
                    step="0.1"
                    name="peso"
                    value={formData.peso}
                    onChange={handleChange}
                    placeholder="Ejemplo: 70"
                  />
                  {renderError("peso")}
                </div>

                <div className="valoracionField">
                  <label className="valoracionLabel">Talla (m)</label>
                  <input
                    className="valoracionInput"
                    type="number"
                    step="0.01"
                    name="talla"
                    value={formData.talla}
                    onChange={handleChange}
                    placeholder="Ejemplo: 1.60"
                  />
                  {renderError("talla")}
                </div>
              </div>

              <div className="anamnesisInfoBox">
                <p>
                  <strong>IMC:</strong> {imc ?? "Sin calcular"}
                </p>
                <p>
                  <strong>Obesidad:</strong> {obesidad ? "Sí" : "No"}
                </p>
              </div>
            </section>

            <section className="anamnesisSection">
              <h3 className="anamnesisSectionTitle">
                4.4 Riesgo cardiovascular
              </h3>

              {renderSiNo(
                "infarto",
                "¿Te ha dado un infarto o tienes problemas de corazón?",
              )}

              {formData.infarto === "SI" &&
                renderSiNo("infarto_menos_3_meses", "¿Hace menos de 3 meses?")}

              {renderSiNo(
                "evento_cerebrovascular",
                "¿Te ha dado un evento cardiovascular (derrame cerebral)?",
              )}

              {formData.evento_cerebrovascular === "SI" &&
                renderSiNo("ecv_menos_6_meses", "¿Hace menos de 6 meses?")}
            </section>

            <section className="anamnesisSection">
              <h3 className="anamnesisSectionTitle">
                4.5 Enfermedades sistémicas
              </h3>

              {renderSiNo(
                "enfermedad_higado",
                "¿Sufre de alguna enfermedad del hígado?",
              )}

              {renderSiNo(
                "enfermedad_rinon",
                "¿Sufre de alguna enfermedad del riñón?",
              )}

              {renderSiNo("anemia", "¿Le han diagnosticado anemia?")}
              {formData.anemia === "SI" &&
                renderSiNo("anemia_controlada", "¿Está controlada?")}

              {renderSiNo(
                "enfermedad_autoinmune",
                "¿Tiene alguna enfermedad autoinmune?",
              )}

              {renderSiNo(
                "enfermedad_psiquiatrica",
                "¿Tiene alguna enfermedad psiquiátrica que requiere tratamiento?",
              )}

              {renderSiNo(
                "cancer_ultimos_5_anos",
                "¿Ha tenido cáncer en los últimos 5 años?",
              )}
            </section>

            <section className="anamnesisSection">
              <h3 className="anamnesisSectionTitle">
                4.6 Procedimientos recientes
              </h3>

              {renderSiNo(
                "cirugia_rodilla",
                "¿Le han realizado cirugía de rodilla?",
              )}
              {renderSiNo(
                "cirugia_cadera",
                "¿Le han realizado cirugía de cadera?",
              )}
              {renderSiNo(
                "cirugia_hombro",
                "¿Le han realizado cirugía de hombro?",
              )}
              {renderSiNo(
                "cirugia_columna",
                "¿Le han realizado cirugía de columna?",
              )}
              {renderSiNo(
                "cirugia_pelvis",
                "¿Le han realizado cirugía de pelvis?",
              )}
              {renderSiNo("cirugia_otra", "¿Le han realizado otra cirugía?")}

              {formData.cirugia_otra === "SI" && (
                <div className="valoracionField">
                  <label className="valoracionLabel">¿Cuál cirugía?</label>
                  <input
                    className="valoracionInput"
                    type="text"
                    name="cirugia_otra_cual"
                    value={formData.cirugia_otra_cual}
                    onChange={handleChange}
                    placeholder="Escribe cuál"
                  />
                  {renderError("cirugia_otra_cual")}
                </div>
              )}

              {(formData.cirugia_rodilla === "SI" ||
                formData.cirugia_cadera === "SI" ||
                formData.cirugia_hombro === "SI" ||
                formData.cirugia_columna === "SI" ||
                formData.cirugia_pelvis === "SI" ||
                formData.cirugia_otra === "SI") &&
                renderSiNo(
                  "cirugia_menos_3_meses",
                  "¿La cirugía fue hace menos de 3 meses?",
                )}
            </section>

            <section className="anamnesisSection">
              <h3 className="anamnesisSectionTitle">4.7 Trauma reciente</h3>

              {renderSiNo(
                "golpe_pelvis",
                "¿Ha tenido un golpe fuerte en su pelvis en menos de 3 meses?",
              )}

              {formData.golpe_pelvis === "SI" && (
                <div className="valoracionField">
                  <label className="valoracionLabel">
                    Nivel de dolor en pelvis (1 a 10)
                  </label>
                  <input
                    className="valoracionInput"
                    type="number"
                    min="1"
                    max="10"
                    name="dolor_pelvis_nivel"
                    value={formData.dolor_pelvis_nivel}
                    onChange={handleChange}
                    placeholder="Ejemplo: 8"
                  />
                  {renderError("dolor_pelvis_nivel")}
                </div>
              )}
            </section>

            <section className="anamnesisSection">
              <h3 className="anamnesisSectionTitle">4.8 Hospitalización</h3>

              {renderSiNo("paso_uci", "¿Ha permanecido en UCI?")}

              {formData.paso_uci === "SI" &&
                renderSiNo("uci_menos_1_ano", "¿Hace menos de 1 año?")}

              {formData.paso_uci === "SI" && (
                <div className="valoracionField">
                  <label className="valoracionLabel">¿Cuál fue la razón?</label>
                  <input
                    className="valoracionInput"
                    type="text"
                    name="razon_uci"
                    value={formData.razon_uci}
                    onChange={handleChange}
                    placeholder="Escribe la razón"
                  />
                  {renderError("razon_uci")}
                </div>
              )}
            </section>

            <section className="anamnesisSection">
              <h3 className="anamnesisSectionTitle">
                4.9 Tratamientos oncológicos
              </h3>

              {renderSiNo(
                "quimioterapia",
                "¿Ha sido sometido a tratamiento por quimioterapia?",
              )}

              {renderSiNo(
                "radioterapia",
                "¿Ha sido sometido a tratamiento por radioterapia?",
              )}
            </section>

            <section className="anamnesisSection">
              <h3 className="anamnesisSectionTitle">4.10 Hábitos</h3>

              {renderSiNo("fuma", "¿Usted fuma?")}

              {formData.fuma === "SI" && (
                <div className="valoracionField">
                  <label className="valoracionLabel">
                    ¿Cuántos cigarrillos al día?
                  </label>
                  <input
                    className="valoracionInput"
                    type="number"
                    min="0"
                    name="cigarrillos_dia"
                    value={formData.cigarrillos_dia}
                    onChange={handleChange}
                    placeholder="Ejemplo: 3"
                  />
                  {renderError("cigarrillos_dia")}
                </div>
              )}

              {renderSiNo("toma_licor", "¿Usted toma licor?")}

              {formData.toma_licor === "SI" && (
                <div className="valoracionField">
                  <label className="valoracionLabel">Frecuencia</label>
                  <select
                    className="valoracionInput"
                    name="frecuencia_licor"
                    value={formData.frecuencia_licor}
                    onChange={handleChange}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="DIARIO">Diario</option>
                    <option value="SEMANAL">Semanal</option>
                    <option value="EVENTUAL">Eventual</option>
                  </select>
                  {renderError("frecuencia_licor")}
                </div>
              )}
            </section>

            <section className="anamnesisSection">
              <h3 className="anamnesisSectionTitle">
                5. Identificación de dolor
              </h3>

              {renderSiNo("dolor_rodilla", "¿Tiene dolor en rodillas?")}
              {renderSiNo("dolor_hombro", "¿Tiene dolor en hombros?")}
              {renderSiNo("dolor_cadera", "¿Tiene dolor en cadera?")}
              {renderSiNo("dolor_lumbar", "¿Tiene dolor en espalda baja?")}
            </section>

            <section className="anamnesisSection">
              <h3 className="anamnesisSectionTitle">
                5.1 Diagnósticos específicos
              </h3>

              {renderSiNo(
                "dx_artrosis_rodilla",
                "¿Tiene diagnóstico de artrosis de rodilla? (por radiografía o resonancia)",
              )}

              {renderSiNo(
                "dx_artrosis_cadera",
                "¿Tiene diagnóstico de artrosis de cadera? (por radiografía o resonancia)",
              )}

              {renderSiNo(
                "dx_lumbalgia_cronica",
                "¿Tiene diagnóstico de lumbalgia crónica? (dolor lumbar de más de 3 meses)",
              )}

              {renderSiNo(
                "dx_manguito_rotador",
                "¿Tiene diagnóstico de daño de manguito rotador? (por ecografía o resonancia)",
              )}
            </section>

            <div className="valoracionActions">
              <button className="valoracionPrimaryBtn" type="submit">
                Evaluar anamnesis global
              </button>
            </div>
          </form>

          {resultado && (
            <div className="anamnesisResultadoCard">
              <h3 className="anamnesisSectionTitle">Resultado de evaluación</h3>

              <ul className="valoracionPacienteList">
                <li>
                  <strong>IMC:</strong> {resultado.imc ?? "Sin calcular"}
                </li>
                <li>
                  <strong>Obesidad:</strong> {resultado.obesidad ? "Sí" : "No"}
                </li>
                <li>
                  <strong>Descartado:</strong>{" "}
                  {resultado.descartado ? "Sí" : "No"}
                </li>
                <li>
                  <strong>Zonas con dolor:</strong>{" "}
                  {resultado.zonasDolor.length > 0
                    ? resultado.zonasDolor.join(", ")
                    : "Ninguna"}
                </li>
                <li>
                  <strong>Siguiente paso:</strong> {resultado.siguientePaso}
                </li>
              </ul>

              {resultado.motivosDescarte.length > 0 && (
                <div className="valoracionStatusAlert valoracionStatusAlert--warn">
                  <strong>Motivos de descarte:</strong>
                  <ul className="anamnesisInlineList">
                    {resultado.motivosDescarte.map((motivo) => (
                      <li key={motivo}>{motivo}</li>
                    ))}
                  </ul>
                </div>
              )}

              {resultado.alertas.length > 0 && (
                <div className="valoracionStatusAlert valoracionStatusAlert--info">
                  <strong>Alertas:</strong>
                  <ul className="anamnesisInlineList">
                    {resultado.alertas.map((alerta) => (
                      <li key={alerta}>{alerta}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
