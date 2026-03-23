import "./BotonImportante.css";

export default function BotonImportante({
  children,
  type = "button",
  onClick,
  disabled = false,
  fullWidth = false,
  variant = "solid",
  className = "",
}) {
  const classes = [
    "botonImportante",
    `botonImportante--${variant}`,
    fullWidth ? "botonImportante--fullWidth" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
