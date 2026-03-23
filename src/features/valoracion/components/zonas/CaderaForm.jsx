import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { caderaInitialState } from "../../config/zonas/caderaInitialState";
import { validarCadera } from "../../services/zonas/validarcadera";
import { evaluarCadera } from "../../services/zonas/evaluarCadera";
import { alertError } from "../../../../shared/lib/alerts";
import CaderaFields from "./CaderaFields";

export default function CaderaForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(caderaInitialState);
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

    const nuevosErrores = validarCadera(formData);

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      setResultado(null);
      return;
    }

    const evaluacion = evaluarCadera(formData);

    setErrores({});
    setResultado(evaluacion);

    console.log("Cadera formData", formData);
    console.log("Cadera evaluación", evaluacion);
  }

  async function handleIrAFotos() {
    if (!resultado) return;

    if (resultado.requiereRevisionProfesional) {
      await alertError(
        "Revisión profesional requerida",
        "Este paciente presenta criterios de posible descarte. El profesional debe definir si autoriza o no la continuación al protocolo fotográfico.",
      );
      return;
    }

    navigate("/herramientas/fotos-test", {
      state: {
        resultado,
        formData,
        zonaProtocoloFotos: "cadera",
        zonaSeleccionadaFinal: "cadera",
      },
    });
  }

  return (
    <section className="anamnesisSection">
      <h3 className="anamnesisSectionTitle">Anamnesis específica de cadera</h3>

      <form className="valoracionForm" onSubmit={handleSubmit}>
        <CaderaFields
          formData={formData}
          errores={errores}
          handleChange={handleChange}
        />

        <div className="valoracionActions">
          <button type="submit" className="valoracionPrimaryBtn">
            Evaluar cadera
          </button>
        </div>
      </form>

      {resultado && (
        <div className="anamnesisResultadoCard">
          <h4 className="anamnesisSectionTitle">Resultado cadera</h4>

          <ul className="valoracionPacienteList">
            <li>
              <strong>Clasificación:</strong> {resultado.clasificacion}
            </li>
            <li>
              <strong>Requiere revisión profesional:</strong>{" "}
              {resultado.requiereRevisionProfesional ? "Sí" : "No"}
            </li>
            <li>
              <strong>Mensaje:</strong> {resultado.mensaje}
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
