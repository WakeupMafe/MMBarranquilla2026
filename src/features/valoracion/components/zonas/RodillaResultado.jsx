export default function RodillaResultado({ resultado }) {
  if (!resultado) return null;

  return (
    <div className="anamnesisResultadoCard">
      <h4 className="anamnesisSectionTitle">Resultado rodilla</h4>

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
  );
}
