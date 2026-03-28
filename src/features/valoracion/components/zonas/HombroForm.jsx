import { useEffect, useState } from "react";

import { hombroInitialState } from "../../config/zonas/hombroInitialState";
import { validarHombro } from "../../services/zonas/validarHombro";
import { evaluarHombro } from "../../services/zonas/evaluarHombro";
import { guardarAnamnesisHombro } from "../../services/zonas/guardarAnamnesisHombro";
import HombroFields from "./HombroFields";
import { useZonaDatosParaGuardado } from "../../hooks/useZonaDatosParaGuardado";
import { alertError } from "../../../../shared/lib/alerts";

export default function HombroForm({
  onZonaEvaluada,
  resultadoPersistido = null,
  numeroDocumento,
  numero_documento_fisico,
  profesionalCedula,
  profesional_cedula,
}) {
  const [formData, setFormData] = useState(
    resultadoPersistido?.formData || hombroInitialState,
  );
  const [errores, setErrores] = useState({});
  const [resultado, setResultado] = useState(
    resultadoPersistido?.resultado || null,
  );

  const { documentoPaciente, profesionalCedula: cedulaProfesional } =
    useZonaDatosParaGuardado({
      numeroDocumento,
      numero_documento_fisico,
      profesionalCedula,
      profesional_cedula,
    });

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

  async function handleSubmit(e) {
    e.preventDefault();

    const nuevosErrores = validarHombro(formData);

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      setResultado(null);
      return;
    }

    const evaluacion = evaluarHombro(formData);

    setErrores({});
    setResultado(evaluacion);

    if (!documentoPaciente) {
      await alertError(
        "Documento no disponible",
        "No se encontró la cédula del paciente (revisa la valoración activa o vuelve a cargar el flujo).",
      );
      return;
    }

    if (!cedulaProfesional) {
      await alertError(
        "Profesional no identificado",
        "No se encontró la cédula del profesional en sesión. Vuelve a identificarte en el flujo de valoración.",
      );
      return;
    }

    try {
      await guardarAnamnesisHombro({
        numero_documento_fisico: documentoPaciente,
        profesional_cedula: cedulaProfesional,
        formData,
        resultado: evaluacion,
      });

      onZonaEvaluada?.("hombro", {
        zona: "hombro",
        resultado: evaluacion,
        formData,
      });

      console.log("Hombro formData", formData);
      console.log("Hombro evaluación", evaluacion);
    } catch (error) {
      console.error("Error guardando anamnesis de hombro:", error);
      await alertError(
        "Error al guardar",
        error?.message ||
          "No fue posible guardar la anamnesis de hombro en base de datos.",
      );
    }
  }

  return (
    <section className="anamnesisSection">
      <h3 className="anamnesisSectionTitle">Anamnesis específica de hombro</h3>

      <form className="valoracionForm" onSubmit={handleSubmit}>
        <HombroFields
          formData={formData}
          errores={errores}
          handleChange={handleChange}
        />

        <div className="valoracionActions">
          <button type="submit" className="valoracionPrimaryBtn">
            Evaluar hombro
          </button>
        </div>
      </form>

      {resultado && (
        <div className="anamnesisResultadoCard">
          <h4 className="anamnesisSectionTitle">Resultado hombro</h4>

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
