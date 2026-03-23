import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { rodillaInitialState } from "../../config/zonas/rodillaInitialState";
import { validarRodilla } from "../../services/zonas/validarRodilla";
import { evaluarRodilla } from "../../services/zonas/evaluarRodilla";
import { alertError } from "../../../../shared/lib/alerts";

export default function RodillaForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(rodillaInitialState);
  const [errores, setErrores] = useState({});
  const [resultado, setResultado] = useState(null);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => {
        const currentValues = prev[name] || [];

        return {
          ...prev,
          [name]: checked
            ? [...currentValues, value]
            : currentValues.filter((item) => item !== value),
        };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setErrores((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const nuevosErrores = validarRodilla(formData);

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      setResultado(null);
      return;
    }

    const evaluacion = evaluarRodilla(formData);

    setErrores({});
    setResultado(evaluacion);

    console.log("Rodilla formData", formData);
    console.log("Rodilla evaluación", evaluacion);
  }

  async function handleIrAFotos() {
    if (!resultado) return;

    if (resultado.requiereRevisionProfesional) {
      await alertError(
        "Revisión clínica requerida",
        "Este caso presenta criterios de posible descarte y requiere validación final por parte del profesional antes de autorizar su continuidad en el protocolo fotográfico.",
      );
      return;
    }

    navigate("/herramientas/fotos-test", {
      state: {
        resultado,
        formData,
        zonaProtocoloFotos: "rodilla",
        zonaSeleccionadaFinal: "rodilla",
      },
    });
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

  function renderCheckboxGroup(name, label, options) {
    return (
      <div className="valoracionField">
        <label className="valoracionLabel">{label}</label>

        <div className="valoracionCheckboxGroup">
          {options.map((option) => (
            <label key={option.value} className="valoracionCheckboxOption">
              <input
                type="checkbox"
                name={name}
                value={option.value}
                checked={(formData[name] || []).includes(option.value)}
                onChange={handleChange}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>

        {renderError(name)}
      </div>
    );
  }

  return (
    <section className="anamnesisSection">
      <h3 className="anamnesisSectionTitle">Anamnesis específica de rodilla</h3>

      <form className="valoracionForm" onSubmit={handleSubmit}>
        <section className="anamnesisSection">
          <h4 className="anamnesisSectionTitle">1. Dolor en rodilla</h4>

          <div className="valoracionField">
            <label className="valoracionLabel">Lado del dolor</label>
            <select
              className="valoracionInput"
              name="dolor_lado"
              value={formData.dolor_lado}
              onChange={handleChange}
            >
              <option value="">Selecciona una opción</option>
              <option value="DERECHA">Derecha</option>
              <option value="IZQUIERDA">Izquierda</option>
              <option value="AMBAS">Ambas</option>
            </select>
            {renderError("dolor_lado")}
          </div>

          <div className="valoracionField">
            <label className="valoracionLabel">Localización del dolor</label>
            <select
              className="valoracionInput"
              name="dolor_localizacion"
              value={formData.dolor_localizacion}
              onChange={handleChange}
            >
              <option value="">Selecciona una opción</option>
              <option value="GLOBAL">Global</option>
              <option value="MEDIAL">Medial</option>
              <option value="ANTERIOR">Anterior</option>
              <option value="POSTERIOR">Posterior</option>
              <option value="FLUCTUANTE">Fluctuante</option>
            </select>
            {renderError("dolor_localizacion")}
          </div>

          <div className="anamnesisGrid">
            <div className="valoracionField">
              <label className="valoracionLabel">
                Intensidad actual (0 a 10)
              </label>
              <input
                className="valoracionInput"
                type="number"
                min="0"
                max="10"
                name="intensidad_dolor_actual"
                value={formData.intensidad_dolor_actual}
                onChange={handleChange}
              />
              {renderError("intensidad_dolor_actual")}
            </div>

            <div className="valoracionField">
              <label className="valoracionLabel">Horas por día</label>
              <input
                className="valoracionInput"
                type="number"
                min="0"
                name="horas_dolor_dia"
                value={formData.horas_dolor_dia}
                onChange={handleChange}
              />
              {renderError("horas_dolor_dia")}
            </div>
          </div>

          <div className="valoracionField">
            <label className="valoracionLabel">Momento del dolor</label>
            <select
              className="valoracionInput"
              name="momento_dolor"
              value={formData.momento_dolor}
              onChange={handleChange}
            >
              <option value="">Selecciona una opción</option>
              <option value="MANANA">Mañana</option>
              <option value="TARDE">Tarde</option>
              <option value="NOCHE">Noche</option>
              <option value="TODO_EL_TIEMPO">Todo el tiempo</option>
            </select>
            {renderError("momento_dolor")}
          </div>

          {renderCheckboxGroup("mejora_con", "Mejora con", [
            { value: "SENTADO", label: "Sentado" },
            { value: "RECOSTADO", label: "Recostado" },
            { value: "HIELO", label: "Hielo" },
            { value: "CALOR", label: "Calor" },
            { value: "MEDICINA", label: "Medicina" },
            { value: "MASAJE", label: "Masaje" },
            { value: "OTRO", label: "Otro" },
          ])}

          {(formData.mejora_con || []).includes("OTRO") && (
            <div className="valoracionField">
              <label className="valoracionLabel">¿Cuál otro?</label>
              <input
                className="valoracionInput"
                type="text"
                name="mejora_con_otro"
                value={formData.mejora_con_otro}
                onChange={handleChange}
              />
              {renderError("mejora_con_otro")}
            </div>
          )}

          <div className="anamnesisGrid">
            <div className="valoracionField">
              <label className="valoracionLabel">
                Dolor inicial al mejorar (0 a 10)
              </label>
              <input
                className="valoracionInput"
                type="number"
                min="0"
                max="10"
                name="dolor_inicial_mejora"
                value={formData.dolor_inicial_mejora}
                onChange={handleChange}
              />
              {renderError("dolor_inicial_mejora")}
            </div>

            <div className="valoracionField">
              <label className="valoracionLabel">
                Dolor final al mejorar (0 a 10)
              </label>
              <input
                className="valoracionInput"
                type="number"
                min="0"
                max="10"
                name="dolor_final_mejora"
                value={formData.dolor_final_mejora}
                onChange={handleChange}
              />
              {renderError("dolor_final_mejora")}
            </div>
          </div>

          <div className="valoracionField">
            <label className="valoracionLabel">Trastorna el descanso</label>
            <select
              className="valoracionInput"
              name="trastorna_descanso"
              value={formData.trastorna_descanso}
              onChange={handleChange}
            >
              <option value="">Selecciona una opción</option>
              <option value="MUCHO">Mucho</option>
              <option value="POCO">Poco</option>
              <option value="NADA">Nada</option>
              <option value="EVENTUAL">Eventual</option>
            </select>
            {renderError("trastorna_descanso")}
          </div>

          {renderSiNo(
            "crepito_ruido",
            "¿Presenta ruido o crépito al mover la rodilla?",
          )}

          <div className="valoracionField">
            <label className="valoracionLabel">Al caminar predomina</label>
            <select
              className="valoracionInput"
              name="al_caminar_sintoma"
              value={formData.al_caminar_sintoma}
              onChange={handleChange}
            >
              <option value="">Selecciona una opción</option>
              <option value="DOLOR">Dolor</option>
              <option value="COJERA">Cojera</option>
              <option value="FATIGA">Fatiga</option>
              <option value="INICIA_DOLOR_Y_MEJORA">
                Inicia con dolor y mejora al caminar
              </option>
            </select>
            {renderError("al_caminar_sintoma")}
          </div>

          <div className="valoracionField">
            <label className="valoracionLabel">
              Dolor en otro segmento (0 a 10)
            </label>
            <input
              className="valoracionInput"
              type="number"
              min="0"
              max="10"
              name="dolor_otro_segmento"
              value={formData.dolor_otro_segmento}
              onChange={handleChange}
            />
            {renderError("dolor_otro_segmento")}
          </div>
        </section>

        <section className="anamnesisSection">
          <h4 className="anamnesisSectionTitle">2. Artrosis de rodilla</h4>

          {renderSiNo(
            "tiene_artrosis_diagnostico",
            "¿Tiene diagnóstico de artrosis por radiografía, resonancia o es evidente?",
          )}

          {formData.tiene_artrosis_diagnostico === "SI" && (
            <>
              <div className="valoracionField">
                <label className="valoracionLabel">Lado de la artrosis</label>
                <select
                  className="valoracionInput"
                  name="artrosis_lado"
                  value={formData.artrosis_lado}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="DERECHA">Derecha</option>
                  <option value="IZQUIERDA">Izquierda</option>
                  <option value="AMBAS">Ambas</option>
                </select>
                {renderError("artrosis_lado")}
              </div>

              <div className="anamnesisGrid">
                <div className="valoracionField">
                  <label className="valoracionLabel">
                    Tiempo de diagnóstico
                  </label>
                  <input
                    className="valoracionInput"
                    type="number"
                    min="0"
                    name="tiempo_diagnostico_valor"
                    value={formData.tiempo_diagnostico_valor}
                    onChange={handleChange}
                  />
                  {renderError("tiempo_diagnostico_valor")}
                </div>

                <div className="valoracionField">
                  <label className="valoracionLabel">Unidad</label>
                  <select
                    className="valoracionInput"
                    name="tiempo_diagnostico_unidad"
                    value={formData.tiempo_diagnostico_unidad}
                    onChange={handleChange}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="MESES">Meses</option>
                    <option value="ANOS">Años</option>
                  </select>
                  {renderError("tiempo_diagnostico_unidad")}
                </div>
              </div>

              {renderSiNo(
                "tiene_radiografia_artrosis",
                "¿Tiene radiografías con artrosis?",
              )}

              <div className="valoracionField">
                <label className="valoracionLabel">Duración de síntomas</label>
                <select
                  className="valoracionInput"
                  name="sintomas_mayor_6_meses"
                  value={formData.sintomas_mayor_6_meses}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="MENOR_6_MESES">Menor a 6 meses</option>
                  <option value="MAYOR_IGUAL_6_MESES">
                    Mayor o igual a 6 meses
                  </option>
                </select>
                {renderError("sintomas_mayor_6_meses")}
              </div>

              {renderSiNo(
                "problemas_caminar",
                "¿Tiene problemas para caminar?",
              )}

              <div className="valoracionField">
                <label className="valoracionLabel">Tratamiento actual</label>
                <select
                  className="valoracionInput"
                  name="tratamiento_artrosis"
                  value={formData.tratamiento_artrosis}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="MEDICAMENTOS">Medicamentos</option>
                  <option value="INFILTRACIONES">Infiltraciones</option>
                  <option value="PENDIENTE_CIRUGIA">Pendiente cirugía</option>
                  <option value="NINGUNO">Ninguno</option>
                </select>
                {renderError("tratamiento_artrosis")}
              </div>

              <div className="valoracionField">
                <label className="valoracionLabel">Cirugía</label>
                <select
                  className="valoracionInput"
                  name="cirugia_artrosis_tiempo"
                  value={formData.cirugia_artrosis_tiempo}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="MENOS_5_ANOS">Hace menos de 5 años</option>
                  <option value="MAS_5_ANOS">Hace más de 5 años</option>
                  <option value="NO_APLICA">No aplica</option>
                </select>
                {renderError("cirugia_artrosis_tiempo")}
              </div>

              <div className="anamnesisGrid">
                <div className="valoracionField">
                  <label className="valoracionLabel">
                    Dolor última semana (0 a 10)
                  </label>
                  <input
                    className="valoracionInput"
                    type="number"
                    min="0"
                    max="10"
                    name="dolor_ultima_semana"
                    value={formData.dolor_ultima_semana}
                    onChange={handleChange}
                  />
                  {renderError("dolor_ultima_semana")}
                </div>

                <div className="valoracionField">
                  <label className="valoracionLabel">
                    Debe parar al caminar por dolor
                  </label>
                  <select
                    className="valoracionInput"
                    name="parar_por_dolor_distancia"
                    value={formData.parar_por_dolor_distancia}
                    onChange={handleChange}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="MENOS_50">Menos de 50 mts</option>
                    <option value="ENTRE_50_200">50 a 200 mts</option>
                    <option value="MAS_200">Más de 200 mts</option>
                  </select>
                  {renderError("parar_por_dolor_distancia")}
                </div>
              </div>

              <div className="valoracionField">
                <label className="valoracionLabel">
                  ¿Cuánto limita el descanso?
                </label>
                <select
                  className="valoracionInput"
                  name="limita_descanso"
                  value={formData.limita_descanso}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="MUCHO">Mucho</option>
                  <option value="POCO">Poco</option>
                  <option value="NADA">Nada</option>
                </select>
                {renderError("limita_descanso")}
              </div>

              <div className="valoracionField">
                <label className="valoracionLabel">El dolor mejora con</label>
                <select
                  className="valoracionInput"
                  name="artrosis_mejora_con"
                  value={formData.artrosis_mejora_con}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="NADA">Nada</option>
                  <option value="REPOSO">Reposo</option>
                  <option value="MEDICAMENTO">Medicamento</option>
                  <option value="CALOR">Calor</option>
                  <option value="FRIO">Frío</option>
                  <option value="OTRO">Otro</option>
                </select>
                {renderError("artrosis_mejora_con")}
              </div>

              {formData.artrosis_mejora_con === "OTRO" && (
                <div className="valoracionField">
                  <label className="valoracionLabel">¿Cuál otro?</label>
                  <input
                    className="valoracionInput"
                    type="text"
                    name="artrosis_mejora_con_otro"
                    value={formData.artrosis_mejora_con_otro}
                    onChange={handleChange}
                  />
                  {renderError("artrosis_mejora_con_otro")}
                </div>
              )}

              <div className="anamnesisGrid">
                <div className="valoracionField">
                  <label className="valoracionLabel">
                    Dolor inicial (0 a 10)
                  </label>
                  <input
                    className="valoracionInput"
                    type="number"
                    min="0"
                    max="10"
                    name="artrosis_dolor_inicial"
                    value={formData.artrosis_dolor_inicial}
                    onChange={handleChange}
                  />
                  {renderError("artrosis_dolor_inicial")}
                </div>

                <div className="valoracionField">
                  <label className="valoracionLabel">
                    Dolor final (0 a 10)
                  </label>
                  <input
                    className="valoracionInput"
                    type="number"
                    min="0"
                    max="10"
                    name="artrosis_dolor_final"
                    value={formData.artrosis_dolor_final}
                    onChange={handleChange}
                  />
                  {renderError("artrosis_dolor_final")}
                </div>
              </div>
            </>
          )}
        </section>

        <section className="anamnesisSection">
          <h4 className="anamnesisSectionTitle">
            3. Marcha y síntomas asociados
          </h4>

          <div className="valoracionField">
            <label className="valoracionLabel">Derrame al caminar</label>
            <select
              className="valoracionInput"
              name="derrame_al_caminar"
              value={formData.derrame_al_caminar}
              onChange={handleChange}
            >
              <option value="">Selecciona una opción</option>
              <option value="MUCHO">Mucho</option>
              <option value="POCO">Poco</option>
              <option value="NADA">Nada</option>
            </select>
            {renderError("derrame_al_caminar")}
          </div>

          <div className="valoracionField">
            <label className="valoracionLabel">Dolor al caminar (0 a 10)</label>
            <input
              className="valoracionInput"
              type="number"
              min="0"
              max="10"
              name="dolor_al_caminar"
              value={formData.dolor_al_caminar}
              onChange={handleChange}
            />
            {renderError("dolor_al_caminar")}
          </div>

          {renderSiNo("cojera_por_rodilla", "¿La rodilla le genera cojera?")}
          {renderSiNo("usa_baston", "¿Requiere el uso de bastón?")}
          {renderSiNo("bloqueos", "¿Presenta bloqueos?")}
          {renderSiNo("fallas", "¿Presenta fallas?")}
        </section>

        <section className="anamnesisSection">
          <h4 className="anamnesisSectionTitle">4. Terapia y ejercicio</h4>

          {renderSiNo("hace_ejercicios", "¿Hace fisioterapia o ejercicios?")}

          {formData.hace_ejercicios === "SI" && (
            <>
              <div className="valoracionField">
                <label className="valoracionLabel">Tipo de ejercicios</label>
                <select
                  className="valoracionInput"
                  name="tipo_ejercicio"
                  value={formData.tipo_ejercicio}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="SOLO">Por su cuenta</option>
                  <option value="DIRIGIDOS">Dirigidos</option>
                </select>
                {renderError("tipo_ejercicio")}
              </div>

              <div className="valoracionField">
                <label className="valoracionLabel">Veces por semana</label>
                <input
                  className="valoracionInput"
                  type="number"
                  min="0"
                  name="veces_ejercicio_semana"
                  value={formData.veces_ejercicio_semana}
                  onChange={handleChange}
                />
                {renderError("veces_ejercicio_semana")}
              </div>

              {Number(formData.veces_ejercicio_semana) > 0 &&
                Number(formData.veces_ejercicio_semana) < 3 && (
                  <div className="valoracionField">
                    <label className="valoracionLabel">
                      Motivo por el cual realiza menos de 3 sesiones por semana
                    </label>
                    <select
                      className="valoracionInput"
                      name="razon_menos_3_semana"
                      value={formData.razon_menos_3_semana}
                      onChange={handleChange}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="NO_ENTIENDE">No entiende</option>
                      <option value="NO_TIENE_AYUDA">No tiene ayuda</option>
                      <option value="NO_TIENE_EQUIPOS">No tiene equipos</option>
                      <option value="NO_RECUERDA_COMO">No recuerda cómo</option>
                      <option value="INCONSTANTE">Inconstante</option>
                    </select>
                    {renderError("razon_menos_3_semana")}
                  </div>
                )}
            </>
          )}

          {renderSiNo("hace_cardio", "¿Hace ejercicio cardiovascular?")}

          {formData.hace_cardio === "SI" && (
            <>
              <div className="valoracionField">
                <label className="valoracionLabel">Tipo de cardio</label>
                <select
                  className="valoracionInput"
                  name="tipo_cardio"
                  value={formData.tipo_cardio}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="CAMINA">Camina</option>
                  <option value="BICICLETA">Bicicleta</option>
                  <option value="PISCINA">Piscina</option>
                  <option value="OTRO">Otro</option>
                </select>
                {renderError("tipo_cardio")}
              </div>

              {formData.tipo_cardio === "OTRO" && (
                <div className="valoracionField">
                  <label className="valoracionLabel">¿Cuál otro?</label>
                  <input
                    className="valoracionInput"
                    type="text"
                    name="tipo_cardio_otro"
                    value={formData.tipo_cardio_otro}
                    onChange={handleChange}
                  />
                  {renderError("tipo_cardio_otro")}
                </div>
              )}

              <div className="valoracionField">
                <label className="valoracionLabel">
                  Veces de cardio por semana
                </label>
                <input
                  className="valoracionInput"
                  type="number"
                  min="0"
                  name="veces_cardio_semana"
                  value={formData.veces_cardio_semana}
                  onChange={handleChange}
                />
                {renderError("veces_cardio_semana")}
              </div>
            </>
          )}
        </section>

        <section className="anamnesisSection">
          <h4 className="anamnesisSectionTitle">5. Estado clínico adicional</h4>

          <div className="valoracionField">
            <label className="valoracionLabel">Derrame</label>
            <select
              className="valoracionInput"
              name="derrame_general"
              value={formData.derrame_general}
              onChange={handleChange}
            >
              <option value="">Selecciona una opción</option>
              <option value="MUCHO">Mucho</option>
              <option value="MODERADO">Moderado</option>
              <option value="POCO">Poco</option>
              <option value="NO">No</option>
            </select>
            {renderError("derrame_general")}
          </div>

          {renderSiNo(
            "diagnostico_confirmado",
            "¿Tiene diagnóstico confirmado?",
          )}
          {renderSiNo("pendiente_examen", "¿Está pendiente de examen?")}
          {renderSiNo("en_tratamiento", "¿Está en tratamiento?")}
          {renderSiNo("espera_cita_manejo", "¿Espera cita para manejo?")}
          {renderSiNo("espera_cirugia", "¿Espera cirugía?")}
        </section>

        <div className="valoracionActions">
          <button type="submit" className="valoracionPrimaryBtn">
            Evaluar rodilla
          </button>
        </div>
      </form>

      {resultado && (
        <div className="anamnesisResultadoCard">
          <h4 className="anamnesisSectionTitle">Resultado rodilla</h4>

          <ul className="valoracionPacienteList">
            <li>
              <strong>Clasificación clínica:</strong> {resultado.clasificacion}
            </li>
            <li>
              <strong>Requiere revisión profesional:</strong>{" "}
              {resultado.requiereRevisionProfesional ? "Sí" : "No"}
            </li>
            <li>
              <strong>Concepto:</strong> {resultado.mensaje}
            </li>
          </ul>

          {resultado.motivosRevisionProfesional?.length > 0 && (
            <div className="valoracionStatusAlert valoracionStatusAlert--warn">
              <strong>Criterios de posible descarte</strong>
              <ul className="anamnesisInlineList">
                {resultado.motivosRevisionProfesional.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {resultado.alertas?.length > 0 && (
            <div className="valoracionStatusAlert valoracionStatusAlert--info">
              <strong>Alertas clínicas</strong>
              <ul className="anamnesisInlineList">
                {resultado.alertas.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {!resultado.requiereRevisionProfesional && (
            <div className="valoracionActions" style={{ marginTop: "16px" }}>
              <button
                type="button"
                className="valoracionPrimaryBtn"
                onClick={handleIrAFotos}
              >
                Continuar a protocolo fotográfico
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
