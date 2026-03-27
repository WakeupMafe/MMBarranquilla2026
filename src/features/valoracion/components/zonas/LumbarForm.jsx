import { useEffect, useState } from "react";

import { lumbarInitialState } from "../../config/zonas/lumbarInitialState";
import { validarLumbar } from "../../services/zonas/validarLumbar";
import { evaluarLumbar } from "../../services/zonas/evaluarLumbar";
import LumbarFields from "./LumbarFields";
import { guardarAnamnesisLumbar } from "../../config/zonas/guardarlumbar";

// dentro de handleSubmit DESPUÉS de evaluar:

await guardarAnamnesisLumbar({
  numeroDocumento: "CEDULA_DEL_PACIENTE", // ⚠️ debes traerla del contexto
  formData,
});
export default function LumbarForm({
  onZonaEvaluada,
  resultadoPersistido = null,
}) {
  const [formData, setFormData] = useState(
    resultadoPersistido?.formData || lumbarInitialState,
  );
  const [errores, setErrores] = useState({});
  const [resultado, setResultado] = useState(
    resultadoPersistido?.resultado || null,
  );

  useEffect(() => {
    if (!resultadoPersistido) return;

    if (resultadoPersistido.formData) {
      setFormData(resultadoPersistido.formData);
    }

    if (resultadoPersistido.resultado) {
      setResultado(resultadoPersistido.resultado);
    }
  }, [resultadoPersistido]);

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

    const nuevosErrores = validarLumbar(formData);

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      setResultado(null);

      onZonaEvaluada?.("lumbar", {
        zona: "lumbar",
        resultado: null,
        formData,
      });

      return;
    }

    const evaluacion = evaluarLumbar(formData);

    setErrores({});
    setResultado(evaluacion);

    onZonaEvaluada?.("lumbar", {
      zona: "lumbar",
      resultado: evaluacion,
      formData,
    });

    console.log("Lumbar formData", formData);
    console.log("Lumbar evaluación", evaluacion);
  }

  return (
    <section className="anamnesisSection">
      <h3 className="anamnesisSectionTitle">Anamnesis específica lumbar</h3>

      <form className="valoracionForm" onSubmit={handleSubmit}>
        <LumbarFields
          formData={formData}
          errores={errores}
          handleChange={handleChange}
        />

        <div className="valoracionActions">
          <button type="submit" className="valoracionPrimaryBtn">
            Evaluar lumbar
          </button>
        </div>
      </form>

      {resultado && (
        <div className="anamnesisResultadoCard">
          <h4 className="anamnesisSectionTitle">Resultado lumbar</h4>

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
        </div>
      )}
    </section>
  );
}
