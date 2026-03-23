export default function LumbarFields({ formData, errores, handleChange }) {
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
    <>
      <section className="anamnesisSection">
        <h4 className="anamnesisSectionTitle">1. Diagnóstico y evolución</h4>

        <div className="valoracionField">
          <label className="valoracionLabel">Tiempo de diagnóstico</label>
          <select
            className="valoracionInput"
            name="tiempo_diagnostico"
            value={formData.tiempo_diagnostico}
            onChange={handleChange}
          >
            <option value="">Selecciona</option>
            <option value="MENOR_6_MESES">Menos de 6 meses</option>
            <option value="ENTRE_6_MESES_Y_1_ANO">6 meses a 1 año</option>
            <option value="MAYOR_1_ANO">Más de 1 año</option>
          </select>
          {renderError("tiempo_diagnostico")}
        </div>

        {renderSiNo(
          "radiografias_dano",
          "¿Tiene radiografías que muestren daño?",
        )}

        <div className="valoracionField">
          <label className="valoracionLabel">Tiempo de síntomas</label>
          <select
            className="valoracionInput"
            name="tiempo_sintomas"
            value={formData.tiempo_sintomas}
            onChange={handleChange}
          >
            <option value="">Selecciona</option>
            <option value="MENOR_6_MESES">Menor a 6 meses</option>
            <option value="MAYOR_6_MESES">Mayor a 6 meses</option>
          </select>
          {renderError("tiempo_sintomas")}
        </div>
      </section>

      <section className="anamnesisSection">
        <h4 className="anamnesisSectionTitle">2. Dolor y marcha</h4>

        {renderSiNo(
          "debe_parar_por_dolor",
          "¿Tiene que parar al caminar por dolor?",
        )}

        {formData.debe_parar_por_dolor === "SI" && (
          <div className="valoracionField">
            <label className="valoracionLabel">
              Distancia en la que debe parar
            </label>
            <select
              className="valoracionInput"
              name="parar_por_dolor_distancia"
              value={formData.parar_por_dolor_distancia}
              onChange={handleChange}
            >
              <option value="">Selecciona</option>
              <option value="MENOS_50">Menos de 50 metros</option>
              <option value="ENTRE_50_200">50 a 200 metros</option>
              <option value="MAS_200">Más de 200 metros</option>
            </select>
            {renderError("parar_por_dolor_distancia")}
          </div>
        )}

        <div className="valoracionField">
          <label className="valoracionLabel">
            Nivel de dolor en la última semana (0 a 10)
          </label>
          <input
            type="number"
            className="valoracionInput"
            name="dolor_semana"
            value={formData.dolor_semana}
            onChange={handleChange}
            min="0"
            max="10"
          />
          {renderError("dolor_semana")}
        </div>

        {renderSiNo(
          "dolor_agudo_irradia_pierna",
          "¿El dolor agudo se irradia a la pierna?",
        )}
      </section>

      <section className="anamnesisSection">
        <h4 className="anamnesisSectionTitle">3. Manejo clínico</h4>

        {renderSiNo("usa_medicamentos", "¿Usa medicamentos para el dolor?")}

        {renderSiNo(
          "cirugias_previas_columna",
          "¿Tiene cirugías previas de columna?",
        )}

        {formData.cirugias_previas_columna === "SI" && (
          <div className="valoracionField">
            <label className="valoracionLabel">Antigüedad de la cirugía</label>
            <select
              className="valoracionInput"
              name="cirugia_antiguedad"
              value={formData.cirugia_antiguedad}
              onChange={handleChange}
            >
              <option value="">Selecciona</option>
              <option value="MENOR_5_ANOS">Menor a 5 años</option>
              <option value="MAYOR_5_ANOS">Mayor a 5 años</option>
            </select>
            {renderError("cirugia_antiguedad")}
          </div>
        )}

        {renderSiNo(
          "pendiente_lista_cirugia",
          "¿Está pendiente o en lista para cirugía?",
        )}
      </section>

      <section className="anamnesisSection">
        <h4 className="anamnesisSectionTitle">4. Terapia y adherencia</h4>

        {renderSiNo("hace_terapia_centro", "¿Hace terapia en un centro?")}

        {formData.hace_terapia_centro === "SI" && (
          <div className="valoracionField">
            <label className="valoracionLabel">
              Veces por semana en centro
            </label>
            <select
              className="valoracionInput"
              name="terapia_veces_semana"
              value={formData.terapia_veces_semana}
              onChange={handleChange}
            >
              <option value="">Selecciona</option>
              <option value="1">1 vez</option>
              <option value="2">2 veces</option>
              <option value="3">3 veces</option>
              <option value="4">4 veces</option>
            </select>
            {renderError("terapia_veces_semana")}
          </div>
        )}

        {renderSiNo(
          "hace_ejercicios_internet",
          "¿Hace ejercicios con explicaciones en internet?",
        )}

        {formData.hace_ejercicios_internet === "SI" && (
          <div className="valoracionField">
            <label className="valoracionLabel">Veces por semana en casa</label>
            <select
              className="valoracionInput"
              name="internet_veces_semana"
              value={formData.internet_veces_semana}
              onChange={handleChange}
            >
              <option value="">Selecciona</option>
              <option value="1">1 vez</option>
              <option value="2">2 veces</option>
              <option value="3">3 veces</option>
              <option value="4">4 veces</option>
            </select>
            {renderError("internet_veces_semana")}
          </div>
        )}

        {formData.hace_terapia_centro === "NO" &&
          formData.hace_ejercicios_internet === "NO" && (
            <div className="valoracionField">
              <label className="valoracionLabel">
                ¿Cuál es la razón de no realizar ejercicios?
              </label>
              <select
                className="valoracionInput"
                name="razon_no_hace_ejercicio"
                value={formData.razon_no_hace_ejercicio}
                onChange={handleChange}
              >
                <option value="">Selecciona</option>
                <option value="FALTA_MOTIVACION">Falta de motivación</option>
                <option value="NO_ENTIENDE">No entiende</option>
                <option value="NO_TIENE_AYUDA">No tiene ayuda</option>
                <option value="NO_TIENE_EQUIPOS">No tiene equipos</option>
              </select>
              {renderError("razon_no_hace_ejercicio")}
            </div>
          )}
      </section>
    </>
  );
}
