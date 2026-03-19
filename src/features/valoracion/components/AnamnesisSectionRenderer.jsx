import { SelectField, TextField, YesNoField } from "./AnamnesisFields";

function renderField(field, formData, errores, handleChange) {
  if (field.showWhen && !field.showWhen(formData)) return null;

  const commonProps = {
    key: field.name,
    label: field.label,
    name: field.name,
    value: formData[field.name],
    onChange: handleChange,
    error: errores[field.name],
  };

  if (field.type === "yesno") {
    return <YesNoField {...commonProps} />;
  }

  if (field.type === "select") {
    return <SelectField {...commonProps} options={field.options || []} />;
  }

  return (
    <TextField
      {...commonProps}
      type={field.inputType || "text"}
      placeholder={field.placeholder}
      min={field.min}
      max={field.max}
      step={field.step}
    />
  );
}

export default function AnamnesisSectionRenderer({
  section,
  formData,
  errores,
  handleChange,
  extraContent,
}) {
  const gridFields = section.fields.filter((field) => field.grid);
  const normalFields = section.fields.filter((field) => !field.grid);

  return (
    <section className="anamnesisSection">
      <h3 className="anamnesisSectionTitle">{section.title}</h3>

      {gridFields.length > 0 && (
        <div className="anamnesisGrid">
          {gridFields.map((field) =>
            renderField(field, formData, errores, handleChange),
          )}
        </div>
      )}

      {normalFields.map((field) =>
        renderField(field, formData, errores, handleChange),
      )}

      {extraContent}
    </section>
  );
}
