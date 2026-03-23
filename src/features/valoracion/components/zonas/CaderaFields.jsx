export default function CaderaFields({ formData, errores, handleChange }) {
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
        <h4 className="anamnesisSectionTitle">1. Dolor de cadera</h4>

        <div className="valoracionField">
          <label className="valoracionLabel">Lado del dolor</label>
          <select
            className="valoracionInput"
            name="dolor_lado"
            value={formData.dolor_lado}
            onChange={handleChange}
          >
            <option value="">Selecciona</option>
            <option value="DERECHA">Derecha</option>
            <option value="IZQUIERDA">Izquierda</option>
            <option value="AMBAS">Ambas</option>
          </select>
          {renderError("dolor_lado")}
        </div>

        <div className="valoracionField">
          <label className="valoracionLabel">Dolor al</label>
          <select
            className="valoracionInput"
            name="dolor_actividad"
            value={formData.dolor_actividad}
            onChange={handleChange}
          >
            <option value="">Selecciona</option>
            <option value="CAMINAR">Caminar</option>
            <option value="SENTADO">Sentado</option>
            <option value="DORMIR">Dormir</option>
          </select>
          {renderError("dolor_actividad")}
        </div>
      </section>

      <section className="anamnesisSection">
        <h4 className="anamnesisSectionTitle">2. Diagnóstico</h4>

        {renderSiNo("diagnostico_cadera", "¿Tiene diagnóstico confirmado?")}

        {formData.diagnostico_cadera === "SI" && (
          <>
            <div className="valoracionField">
              <label className="valoracionLabel">Tiempo de diagnóstico</label>
              <input
                type="number"
                className="valoracionInput"
                name="tiempo_diagnostico"
                value={formData.tiempo_diagnostico}
                onChange={handleChange}
              />
              {renderError("tiempo_diagnostico")}
            </div>

            <div className="valoracionField">
              <label className="valoracionLabel">Unidad</label>
              <select
                className="valoracionInput"
                name="tiempo_unidad"
                value={formData.tiempo_unidad}
                onChange={handleChange}
              >
                <option value="">Selecciona</option>
                <option value="MESES">Meses</option>
                <option value="ANOS">Años</option>
              </select>
              {renderError("tiempo_unidad")}
            </div>
          </>
        )}
      </section>

      <section className="anamnesisSection">
        <h4 className="anamnesisSectionTitle">2.1 Artrosis de cadera</h4>

        {renderSiNo(
          "artrosis_cadera",
          "¿Tiene diagnóstico de artrosis de cadera?",
        )}

        {formData.artrosis_cadera === "SI" && (
          <>
            <div className="valoracionField">
              <label className="valoracionLabel">Lado de la artrosis</label>
              <select
                className="valoracionInput"
                name="artrosis_lado"
                value={formData.artrosis_lado || ""}
                onChange={handleChange}
              >
                <option value="">Selecciona</option>
                <option value="DERECHA">Derecha</option>
                <option value="IZQUIERDA">Izquierda</option>
                <option value="AMBAS">Ambas</option>
              </select>
              {renderError("artrosis_lado")}
            </div>

            <div className="valoracionField">
              <label className="valoracionLabel">Tiempo del diagnóstico</label>
              <select
                className="valoracionInput"
                name="tiempo_diagnostico_categoria"
                value={formData.tiempo_diagnostico_categoria || ""}
                onChange={handleChange}
              >
                <option value="">Selecciona</option>
                <option value="MENOR_6_MESES">Menor a 6 meses</option>
                <option value="MAYOR_6_MESES">Mayor a 6 meses</option>
              </select>
              {renderError("tiempo_diagnostico_categoria")}
            </div>

            {renderSiNo(
              "radiografias_artrosis",
              "¿Tiene radiografías con artrosis?",
            )}
          </>
        )}
      </section>

      <section className="anamnesisSection">
        <h4 className="anamnesisSectionTitle">3. Marcha y síntomas</h4>

        {renderSiNo("problemas_caminar", "¿Tiene problemas al caminar?")}

        {formData.problemas_caminar === "SI" && (
          <div className="valoracionField">
            <label className="valoracionLabel">
              ¿Qué predomina al caminar?
            </label>
            <select
              className="valoracionInput"
              name="problema_al_caminar"
              value={formData.problema_al_caminar || ""}
              onChange={handleChange}
            >
              <option value="">Selecciona</option>
              <option value="COJERA">Cojera</option>
              <option value="DOLOR">Dolor</option>
              <option value="FATIGA">Fatiga</option>
            </select>
            {renderError("problema_al_caminar")}
          </div>
        )}

        <div className="valoracionField">
          <label className="valoracionLabel">
            Nivel de dolor última semana (0 a 10)
          </label>
          <input
            type="number"
            className="valoracionInput"
            name="dolor_semana"
            value={formData.dolor_semana}
            onChange={handleChange}
          />
          {renderError("dolor_semana")}
        </div>

        {renderSiNo(
          "debe_parar_por_dolor",
          "¿Al caminar debe parar por dolor?",
        )}

        {formData.debe_parar_por_dolor === "SI" && (
          <div className="valoracionField">
            <label className="valoracionLabel">
              Distancia en la que debe parar
            </label>
            <select
              className="valoracionInput"
              name="parar_por_dolor_distancia"
              value={formData.parar_por_dolor_distancia || ""}
              onChange={handleChange}
            >
              <option value="">Selecciona</option>
              <option value="MENOS_50">Menos de 50 metros</option>
              <option value="ENTRE_50_100">50 a 100 metros</option>
              <option value="MAS_100">Más de 100 metros</option>
            </select>
            {renderError("parar_por_dolor_distancia")}
          </div>
        )}

        {renderSiNo("pendiente_examen", "¿Está pendiente de examen?")}
        {renderSiNo("en_tratamiento", "¿Está actualmente en tratamiento?")}
        {renderSiNo(
          "pendiente_lista_cirugia",
          "¿Está pendiente o en lista para cirugía?",
        )}
      </section>

      <section className="anamnesisSection">
        <h4 className="anamnesisSectionTitle">4. Cirugías y estabilidad</h4>

        {renderSiNo(
          "cirugias_previas_cadera",
          "¿Tiene cirugías previas en cadera?",
        )}

        {formData.cirugias_previas_cadera === "SI" && (
          <>
            <div className="valoracionField">
              <label className="valoracionLabel">Lado de la cirugía</label>
              <select
                className="valoracionInput"
                name="cirugia_lado"
                value={formData.cirugia_lado || ""}
                onChange={handleChange}
              >
                <option value="">Selecciona</option>
                <option value="DERECHA">Derecha</option>
                <option value="IZQUIERDA">Izquierda</option>
                <option value="AMBAS">Ambas</option>
              </select>
              {renderError("cirugia_lado")}
            </div>

            <div className="valoracionField">
              <label className="valoracionLabel">
                Antigüedad de la cirugía
              </label>
              <select
                className="valoracionInput"
                name="cirugia_antiguedad"
                value={formData.cirugia_antiguedad || ""}
                onChange={handleChange}
              >
                <option value="">Selecciona</option>
                <option value="MENOR_5_ANOS">Menor a 5 años</option>
                <option value="MAYOR_5_ANOS">Mayor a 5 años</option>
              </select>
              {renderError("cirugia_antiguedad")}
            </div>
          </>
        )}

        {renderSiNo("falla_cadera", "¿Le falla la cadera?")}
      </section>

      <section className="anamnesisSection">
        <h4 className="anamnesisSectionTitle">5. Terapia y adherencia</h4>

        {renderSiNo("hace_ejercicio", "¿Hace ejercicios por su cuenta?")}

        {formData.hace_ejercicio === "SI" && (
          <div className="valoracionField">
            <label className="valoracionLabel">Veces por semana</label>
            <input
              type="number"
              className="valoracionInput"
              name="veces_semana"
              value={formData.veces_semana}
              onChange={handleChange}
            />
            {renderError("veces_semana")}
          </div>
        )}

        {renderSiNo("hace_terapia_centro", "¿Hace terapia en un centro?")}

        {formData.hace_terapia_centro === "SI" && (
          <div className="valoracionField">
            <label className="valoracionLabel">
              Veces por semana en centro
            </label>
            <select
              className="valoracionInput"
              name="terapia_veces_semana"
              value={formData.terapia_veces_semana || ""}
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
          "¿Hace ejercicios con explicaciones en internet o en casa?",
        )}

        {formData.hace_ejercicios_internet === "SI" && (
          <div className="valoracionField">
            <label className="valoracionLabel">Veces por semana en casa</label>
            <select
              className="valoracionInput"
              name="internet_veces_semana"
              value={formData.internet_veces_semana || ""}
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

        {formData.hace_ejercicio === "NO" &&
          formData.hace_terapia_centro === "NO" &&
          formData.hace_ejercicios_internet === "NO" && (
            <div className="valoracionField">
              <label className="valoracionLabel">
                ¿Cuál es la razón de no realizar ejercicios?
              </label>
              <select
                className="valoracionInput"
                name="razon_no_hace_ejercicio"
                value={formData.razon_no_hace_ejercicio || ""}
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
