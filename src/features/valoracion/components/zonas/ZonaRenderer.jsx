import RodillaForm from "./RodillaForm";
import CaderaForm from "./CaderaForm";
import LumbarForm from "./LumbarForm";
import HombroForm from "./HombroForm";

function normalizarZona(zona) {
  return String(zona || "")
    .trim()
    .toLowerCase();
}

export default function ZonaRenderer({
  zona,
  onZonaEvaluada,
  resultadoPersistido,
  numeroDocumento,
  numero_documento_fisico,
  profesionalCedula,
  profesional_cedula,
}) {
  const zonaNormalizada = normalizarZona(zona);

  const documentoPaciente = numeroDocumento || numero_documento_fisico || "";

  const cedulaProfesional = profesionalCedula || profesional_cedula || "";

  if (zonaNormalizada === "rodilla") {
    return (
      <RodillaForm
        onZonaEvaluada={onZonaEvaluada}
        resultadoPersistido={resultadoPersistido}
        numeroDocumento={documentoPaciente}
        numero_documento_fisico={documentoPaciente}
        profesionalCedula={cedulaProfesional}
        profesional_cedula={cedulaProfesional}
      />
    );
  }

  if (zonaNormalizada === "cadera") {
    return (
      <CaderaForm
        onZonaEvaluada={onZonaEvaluada}
        resultadoPersistido={resultadoPersistido}
        numeroDocumento={documentoPaciente}
        numero_documento_fisico={documentoPaciente}
        profesionalCedula={cedulaProfesional}
        profesional_cedula={cedulaProfesional}
      />
    );
  }

  if (zonaNormalizada === "lumbar" || zonaNormalizada === "espalda") {
    return (
      <LumbarForm
        onZonaEvaluada={onZonaEvaluada}
        resultadoPersistido={resultadoPersistido}
        numeroDocumento={documentoPaciente}
        numero_documento_fisico={documentoPaciente}
        profesionalCedula={cedulaProfesional}
        profesional_cedula={cedulaProfesional}
      />
    );
  }

  if (zonaNormalizada === "hombro") {
    return (
      <HombroForm
        onZonaEvaluada={onZonaEvaluada}
        resultadoPersistido={resultadoPersistido}
        numeroDocumento={documentoPaciente}
        numero_documento_fisico={documentoPaciente}
        profesionalCedula={cedulaProfesional}
        profesional_cedula={cedulaProfesional}
      />
    );
  }

  return (
    <section className="anamnesisSection">
      <h3 className="anamnesisSectionTitle">{zona}</h3>
      <div className="valoracionStatusAlert valoracionStatusAlert--info">
        <strong>Zona no configurada</strong>
        <p>No existe todavía un formulario asociado para esta zona.</p>
      </div>
    </section>
  );
}
