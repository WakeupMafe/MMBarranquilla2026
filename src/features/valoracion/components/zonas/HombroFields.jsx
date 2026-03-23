export default function HombroFields({ formData, errores, handleChange }) {
  function renderError(name) {
    if (!errores[name]) return null;
    return <p className="valoracionFieldError">{errores[name]}</p>;
  }

  return (
    <>
      <section className="anamnesisSection">
        <h4 className="anamnesisSectionTitle">1. Dolor de hombro</h4>

        <div className="valoracionField">
          <label className="valoracionLabel">
            Dolor en hombro en la última semana (0 a 10)
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

        <div className="valoracionField">
          <label className="valoracionLabel">Dolor para</label>
          <select
            className="valoracionInput"
            name="dolor_para"
            value={formData.dolor_para}
            onChange={handleChange}
          >
            <option value="">Selecciona</option>
            <option value="DORMIR">Dormir</option>
            <option value="LEVANTAR_BRAZO">Levantar el brazo</option>
            <option value="AGARRAR_CON_LA_MANO">Agarrar con la mano</option>
            <option value="COGER_OBJETOS_ALTOS">Coger objetos altos</option>
            <option value="CARGAR_PAQUETES">Cargar paquetes</option>
            <option value="COLGAR_ROPA">Colgar ropa</option>
          </select>
          {renderError("dolor_para")}
        </div>

        <div className="valoracionField">
          <label className="valoracionLabel">Limitación funcional</label>
          <select
            className="valoracionInput"
            name="limitacion_funcional"
            value={formData.limitacion_funcional}
            onChange={handleChange}
          >
            <option value="">Selecciona</option>
            <option value="ELEVAR_BRAZOS">Elevar los brazos</option>
            <option value="ATARSE_SOSTEN">Atarse el sostén</option>
            <option value="VESTIRSE">Vestirse</option>
            <option value="DORMIR_DE_LADO">Dormir de lado</option>
          </select>
          {renderError("limitacion_funcional")}
        </div>
      </section>
    </>
  );
}
