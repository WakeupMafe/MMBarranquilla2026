import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { lumbarInitialState } from "../../config/zonas/lumbarInitialState";
import { validarLumbar } from "../../services/zonas/validarLumbar";
import { evaluarLumbar } from "../../services/zonas/evaluarLumbar";
import { alertError } from "../../../../shared/lib/alerts";
import LumbarFields from "./LumbarFields";

export default function LumbarForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(lumbarInitialState);
  const [errores, setErrores] = useState({});
  const [resultado, setResultado] = useState(null);

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
      return;
    }

    const evaluacion = evaluarLumbar(formData);

    setErrores({});
    setResultado(evaluacion);

    console.log("Lumbar formData", formData);
    console.log("Lumbar evaluación", evaluacion);
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
        zonaProtocoloFotos: "lumbar",
        zonaSeleccionadaFinal: "lumbar",
      },
    });
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
