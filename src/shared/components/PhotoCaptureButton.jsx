export default function PhotoCaptureButton({
  label,
  inputId,
  onChange,
  capture,
  multiple = false,
  secondary = false,
  className = "",
}) {
  return (
    <label
      htmlFor={inputId}
      className={`${
        secondary ? "btnSecondary fileButton" : "btnPrimary fileButton"
      } ${className}`}
    >
      {label}

      <input
        id={inputId}
        type="file"
        accept="image/*"
        capture={capture}
        multiple={multiple}
        onChange={onChange}
        className="hiddenFileInput"
      />
    </label>
  );
}
