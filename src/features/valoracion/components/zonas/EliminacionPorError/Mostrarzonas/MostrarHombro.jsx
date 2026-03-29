import "./MostrarHombro.css";

function formatearFecha(valor) {
  if (!valor) return "Sin dato";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return String(valor);
  return fecha.toLocaleString("es-CO");
}

function textoSiNo(valor) {
  if (valor === true) return "Sí";
  if (valor === false) return "No";
  return "Sin dato";
}

function textoLista(valor) {
  if (valor == null) return null;
  if (Array.isArray(valor)) {
    if (valor.length === 0) return null;
    return valor.map((item) =>
      typeof item === "object" ? JSON.stringify(item) : String(item),
    );
  }
  return [String(valor)];
}

function textoEntero(valor) {
  if (valor == null || valor === "") return "Sin dato";
  return String(valor);
}

function texto(valor) {
  if (valor == null || String(valor).trim() === "") return "Sin dato";
  return String(valor);
}

/**
 * Vista detallada de un registro de `anamnesis_hombro` en búsqueda / eliminación.
 */
export default function MostrarHombro({ row }) {
  const r = row || {};
  const alertas = textoLista(r.alertas);
  const motivos = textoLista(r.motivos_revision_profesional);
  const revision = r.requiere_revision_profesional === true;

  return (
    <div className="mz-hombro">
      <div className="mz-hombro__head">
        <h4 className="mz-hombro__title">Zona hombro</h4>
        {r.clasificacion ? (
          <span className="mz-hombro__clasificacion">{texto(r.clasificacion)}</span>
        ) : null}
      </div>

      <div className="mz-hombro__flags">
        <span
          className={
            revision
              ? "mz-hombro__flag mz-hombro__flag--warn"
              : "mz-hombro__flag mz-hombro__flag--ok"
          }
        >
          Revisión profesional: {textoSiNo(r.requiere_revision_profesional)}
        </span>
        <span className="mz-hombro__flag">
          Dolor (semanas): {textoEntero(r.dolor_semana)}
        </span>
      </div>

      <div className="mz-hombro__grid">
        <div className="mz-hombro__field">
          <span className="mz-hombro__label">Documento</span>
          <span className="mz-hombro__value">{texto(r.numero_documento_fisico)}</span>
        </div>
        <div className="mz-hombro__field">
          <span className="mz-hombro__label">Dolor para</span>
          <span className="mz-hombro__value">{texto(r.dolor_para)}</span>
        </div>
        <div className="mz-hombro__field">
          <span className="mz-hombro__label">Limitación funcional</span>
          <span className="mz-hombro__value">{texto(r.limitacion_funcional)}</span>
        </div>
        <div className="mz-hombro__field">
          <span className="mz-hombro__label">Profesional (cédula)</span>
          <span className="mz-hombro__value">{texto(r.profesional_cedula)}</span>
        </div>
        <div className="mz-hombro__field">
          <span className="mz-hombro__label">Creado</span>
          <span className="mz-hombro__value mz-hombro__value--muted">
            {formatearFecha(r.created_at)}
          </span>
        </div>
        <div className="mz-hombro__field">
          <span className="mz-hombro__label">Actualizado</span>
          <span className="mz-hombro__value mz-hombro__value--muted">
            {formatearFecha(r.updated_at)}
          </span>
        </div>
      </div>

      {r.mensaje ? (
        <div>
          <p className="mz-hombro__section-title">Mensaje</p>
          <p className="mz-hombro__mensaje">{String(r.mensaje)}</p>
        </div>
      ) : null}

      <div>
        <p className="mz-hombro__section-title">Alertas</p>
        {alertas?.length ? (
          <ul className="mz-hombro__list">
            {alertas.map((item, i) => (
              <li key={`alerta-${i}`}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="mz-hombro__empty">Sin alertas registradas.</p>
        )}
      </div>

      {revision ? (
        <div>
          <p className="mz-hombro__section-title">Motivos revisión profesional</p>
          {motivos?.length ? (
            <ul className="mz-hombro__list">
              {motivos.map((item, i) => (
                <li key={`motivo-${i}`}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mz-hombro__empty">Sin motivos detallados.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
