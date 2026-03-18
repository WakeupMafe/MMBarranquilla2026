import RodillaForm from "./RodillaForm";
import CaderaForm from "./CaderaForm";
import LumbarForm from "./LumbarForm";
import HombroForm from "./HombroForm";

export default function ZonaRenderer({ zona }) {
  if (zona === "rodilla") {
    return <RodillaForm />;
  }

  if (zona === "cadera") {
    return <CaderaForm />;
  }

  if (zona === "lumbar") {
    return <LumbarForm />;
  }

  if (zona === "hombro") {
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
