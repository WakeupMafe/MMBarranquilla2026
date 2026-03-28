import { useEffect, useMemo, useState } from "react";

import { lumbarInitialState } from "../../config/zonas/lumbarInitialState";
import { validarLumbar } from "../../services/zonas/validarLumbar";
import { evaluarLumbar } from "../../services/zonas/evaluarLumbar";
import LumbarFields from "./LumbarFields";
import { guardarAnamnesisLumbar } from "../../config/zonas/guardarlumbar";
import { alertError, alertOk } from "../../../../shared/lib/alerts";

function normalizarDocumento(valor) {
  return String(valor ?? "")
    .replace(/\D/g, "")
    .trim();
}

export default function LumbarForm({
  onZonaEvaluada,
  resultadoPersistido = null,
  numeroDocumento,
}) {
  const [formData, setFormData] = useState(
    resultadoPersistido?.formData || lumbarInitialState,
  );
  const [errores, setErrores] = useState({});
  const [resultado, setResultado] = useState(
    resultadoPersistido?.resultado || null,
  );
  const [guardando, setGuardando] = useState(false);

  const numeroDocumentoLimpio = useMemo(
    () => normalizarDocumento(numeroDocumento),
    [numeroDocumento],
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

  async function handleSubmit(e) {
    e.preventDefault();

    if (guardando) return;

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

    if (!numeroDocumentoLimpio) {
      await alertError(
        "Documento no disponible",
        "No se encontró la cédula del paciente para guardar la anamnesis lumbar.",
      );
      return;
    }

    const evaluacion = evaluarLumbar(formData);

    setErrores({});
    setResultado(evaluacion);

    try {
      setGuardando(true);

      await guardarAnamnesisLumbar({
        numeroDocumento: numeroDocumentoLimpio,
        formData,
      });

      onZonaEvaluada?.("lumbar", {
        zona: "lumbar",
        resultado: evaluacion,
        formData,
      });

      await alertOk("Anamnesis lumbar guardada correctamente.");
    } catch (error) {
      console.error("Error guardando anamnesis lumbar:", error);

      await alertError(
        error?.message ||
          "No fue posible guardar la anamnesis lumbar en base de datos.",
      );
    } finally {
      setGuardando(false);
    }
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
          <button
            type="submit"
            className="valoracionPrimaryBtn"
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Evaluar lumbar"}
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
