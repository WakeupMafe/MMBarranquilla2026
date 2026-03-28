import { useEffect, useState } from "react";

import { rodillaInitialState } from "../../config/zonas/rodillaInitialState";
import { validarRodilla } from "../../services/zonas/validarRodilla";
import { evaluarRodilla } from "../../services/zonas/evaluarRodilla";
import { guardarAnamnesisRodilla } from "../../services/zonas/guardarAnamnesisRodilla";
import RodillaFields from "./RodillaFields";
import { useZonaDatosParaGuardado } from "../../hooks/useZonaDatosParaGuardado";
import { alertError } from "../../../../shared/lib/alerts";

export default function RodillaForm({
  numeroDocumento,
  numero_documento_fisico,
  profesionalCedula,
  profesional_cedula,
  onZonaEvaluada,
  resultadoPersistido = null,
}) {
  const [formData, setFormData] = useState(
    resultadoPersistido?.formData || rodillaInitialState,
  );
  const [errores, setErrores] = useState({});
  const [resultado, setResultado] = useState(
    resultadoPersistido?.resultado || null,
  );
  const [guardando, setGuardando] = useState(false);

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

  async function handleSubmit(e) {
    e.preventDefault();

    const nuevosErrores = validarRodilla(formData);

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      setResultado(null);

      onZonaEvaluada?.("rodilla", {
        zona: "rodilla",
        resultado: null,
        formData,
      });

      return;
    }

    const evaluacion = evaluarRodilla(formData);

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
      setGuardando(true);

      await guardarAnamnesisRodilla({
        numero_documento_fisico: documentoPaciente,
        profesional_cedula: cedulaProfesional,
        formData,
        resultado: evaluacion,
      });

      onZonaEvaluada?.("rodilla", {
        zona: "rodilla",
        resultado: evaluacion,
        formData,
      });

      console.log("Rodilla formData", formData);
      console.log("Rodilla evaluación", evaluacion);
      console.log("Rodilla guardada en BD correctamente");
    } catch (error) {
      console.error("Error guardando anamnesis de rodilla:", error);
      await alertError(
        "Error al guardar",
        error?.message ||
          "No fue posible guardar la anamnesis de rodilla en base de datos.",
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <RodillaFields
      formData={formData}
      errores={errores}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      resultado={resultado}
      guardando={guardando}
    />
  );
}
