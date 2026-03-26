import RodillaForm from "./RodillaForm";
import CaderaForm from "./CaderaForm";
import LumbarForm from "./LumbarForm";
import HombroForm from "./HombroForm";

// 🔹 Normaliza el nombre de la zona para evitar errores por mayúsculas o espacios
function normalizarZona(zona) {
  return String(zona || "")
    .trim()
    .toLowerCase();
}

export default function ZonaRenderer({
  zona,
  onZonaEvaluada,
  resultadoPersistido,

  // 🔥 NUEVO: estos vienen desde AnamnesisZona
  numero_documento_fisico,
  profesional_cedula,
}) {
  const zonaNormalizada = normalizarZona(zona);

  // 🦵 RODILLA
  if (zonaNormalizada === "rodilla") {
    return (
      <RodillaForm
        onZonaEvaluada={onZonaEvaluada}
        resultadoPersistido={resultadoPersistido}
        // 🔥 Se pasan las props necesarias para guardar en BD
        numero_documento_fisico={numero_documento_fisico}
        profesional_cedula={profesional_cedula}
      />
    );
  }

  // 🦴 CADERA
  if (zonaNormalizada === "cadera") {
    return (
      <CaderaForm
        onZonaEvaluada={onZonaEvaluada}
        resultadoPersistido={resultadoPersistido}
        // 🔥 IMPORTANTE:
        // Esto permite que CaderaForm pueda guardar en BD
        numero_documento_fisico={numero_documento_fisico}
        profesional_cedula={profesional_cedula}
      />
    );
  }

  // 🧍 LUMBAR / ESPALDA
  if (zonaNormalizada === "lumbar" || zonaNormalizada === "espalda") {
    return (
      <LumbarForm
        onZonaEvaluada={onZonaEvaluada}
        resultadoPersistido={resultadoPersistido}
        // 🔥 Preparado para futuro guardado en BD
        numero_documento_fisico={numero_documento_fisico}
        profesional_cedula={profesional_cedula}
      />
    );
  }

  // 💪 HOMBRO
  if (zonaNormalizada === "hombro") {
    return (
      <HombroForm
        onZonaEvaluada={onZonaEvaluada}
        resultadoPersistido={resultadoPersistido}
        // 🔥 CLAVE:
        // Sin esto NO guarda en BD
        numero_documento_fisico={numero_documento_fisico}
        profesional_cedula={profesional_cedula}
      />
    );
  }

  // 🚫 FALLBACK (zona no implementada)
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
