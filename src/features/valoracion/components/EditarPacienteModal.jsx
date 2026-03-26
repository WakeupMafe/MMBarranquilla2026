import BotonImportante from "../../../shared/components/BotonImportante/BotonImportante";

export default function EditarPacienteModal({
  visible,
  loading = false,
  formEdicion,
  onChange,
  onClose,
  onSave,
}) {
  if (!visible) return null;

  return (
    <div className="editorPacienteOverlay">
      <div className="editorPacienteModal">
        <div className="editorPacienteHeader">
          <h3 className="editorPacienteTitle">Editar datos del paciente</h3>
          <p className="editorPacienteSubtitle">
            Puedes modificar nombre, género, teléfono y fecha de nacimiento. La
            cédula no es editable.
          </p>
        </div>

        <div className="editorPacienteForm">
          <div className="editorPacienteField">
            <label className="editorPacienteLabel">Nombre</label>
            <input
              className="editorPacienteInput"
              type="text"
              name="nombre_apellido_documento"
              value={formEdicion.nombre_apellido_documento || ""}
              onChange={onChange}
            />
          </div>

          <div className="editorPacienteField">
            <label className="editorPacienteLabel">Género</label>
            <select
              className="editorPacienteInput"
              name="genero"
              value={formEdicion.genero || ""}
              onChange={onChange}
            >
              <option value="">Selecciona una opción</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
              <option value="Indeterminado">Indeterminado</option>
              <option value="Prefiero no responder">
                Prefiero no responder
              </option>
            </select>
          </div>

          <div className="editorPacienteField">
            <label className="editorPacienteLabel">Teléfono</label>
            <input
              className="editorPacienteInput"
              type="text"
              name="numero_telefono"
              value={formEdicion.numero_telefono || ""}
              onChange={onChange}
            />
          </div>

          <div className="editorPacienteField">
            <label className="editorPacienteLabel">Fecha de nacimiento</label>
            <input
              className="editorPacienteInput"
              type="date"
              name="fecha_nacimiento"
              value={formEdicion.fecha_nacimiento || ""}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="editorPacienteActions">
          <BotonImportante type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </BotonImportante>

          <BotonImportante type="button" onClick={onSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </BotonImportante>
        </div>
      </div>
    </div>
  );
}
