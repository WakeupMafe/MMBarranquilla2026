import BotonImportante from "../../../shared/components/BotonImportante/BotonImportante";

export default function UploadModeControl({
  title,
  mode,
  realValue,
  simulationValue,
  onChange,
  realLabel,
  simulationLabel,
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3
        className="valoracionCardTitle"
        style={{ fontSize: "1rem", marginBottom: 12 }}
      >
        {title}
      </h3>

      <div className="valoracionActionsResponsive">
        <BotonImportante
          type="button"
          variant={mode === realValue ? "solid" : "outline"}
          fullWidth
          onClick={() => onChange(realValue)}
        >
          {realLabel}
        </BotonImportante>

        <BotonImportante
          type="button"
          variant={mode === simulationValue ? "solid" : "outline"}
          fullWidth
          onClick={() => onChange(simulationValue)}
        >
          {simulationLabel}
        </BotonImportante>
      </div>
    </div>
  );
}
