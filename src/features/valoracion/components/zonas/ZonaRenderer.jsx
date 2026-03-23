import RodillaForm from "./RodillaForm";
import CaderaForm from "./CaderaForm";
import LumbarForm from "./LumbarForm";
import HombroForm from "./HombroForm";

function normalizarZona(zona) {
  return String(zona || "")
    .trim()
    .toLowerCase();
}

export default function ZonaRenderer({ zona }) {
  const zonaNormalizada = normalizarZona(zona);

  if (zonaNormalizada === "rodilla") {
    return <RodillaForm />;
  }

  if (zonaNormalizada === "cadera") {
    return <CaderaForm />;
  }

  if (zonaNormalizada === "lumbar" || zonaNormalizada === "espalda") {
    return <LumbarForm />;
  }

  if (zonaNormalizada === "hombro") {
    return <HombroForm />;
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
