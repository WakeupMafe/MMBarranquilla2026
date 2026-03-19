export function FieldError({ error }) {
  if (!error) return null;
  return <p className="valoracionFieldError">{error}</p>;
}

export function TextField({
  label,
  name,
  value,
  onChange,
  error,
  placeholder = "",
  type = "text",
  min,
  max,
  step,
}) {
  return (
    <div className="valoracionField">
      <label className="valoracionLabel">{label}</label>
      <input
        className="valoracionInput"
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
      />
      <FieldError error={error} />
    </div>
  );
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  error,
  options = [],
  placeholder = "Selecciona una opción",
}) {
  return (
    <div className="valoracionField">
      <label className="valoracionLabel">{label}</label>
      <select
        className="valoracionInput"
        name={name}
        value={value ?? ""}
        onChange={onChange}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError error={error} />
    </div>
  );
}

export function YesNoField({ label, name, value, onChange, error }) {
  return (
    <div className="valoracionField">
      <label className="valoracionLabel">{label}</label>

      <div className="valoracionRadioGroup">
        <label className="valoracionRadioOption">
          <input
            type="radio"
            name={name}
            value="SI"
            checked={value === "SI"}
            onChange={onChange}
          />
          <span>Sí</span>
        </label>

        <label className="valoracionRadioOption">
          <input
            type="radio"
            name={name}
            value="NO"
            checked={value === "NO"}
            onChange={onChange}
          />
          <span>No</span>
        </label>
      </div>

      <FieldError error={error} />
    </div>
  );
}
