import "./ToolCard.css";
export default function ToolCard({
  title = "Valoración Inicial",
  subtitle = "Registro de clasificación del paciente",
  chipLeft = "15–20 min",
  chipRight = "Obligatoria",
  buttonText = "Abrir",
  onOpen,
  iconSrc, // pásale tu imagen (png/svg)
}) {
  return (
    <div className="toolCard">
      <div className="toolCard__top">
        <div className="toolCard__iconWrap">
          {iconSrc ? (
            <img className="toolCard__icon" src={iconSrc} alt="" />
          ) : (
            <div className="toolCard__iconPlaceholder" />
          )}
        </div>

        <div className="toolCard__info">
          <h3 className="toolCard__title">{title}</h3>
          <p className="toolCard__subtitle">{subtitle}</p>

          <div className="toolCard__chips">
            <span className="toolCard__chip">{chipLeft}</span>
            <span className="toolCard__chip">{chipRight}</span>
          </div>
        </div>
      </div>

      <button className="toolCard__btn" onClick={onOpen} type="button">
        <span>{buttonText}</span>
        <span className="toolCard__arrow">›</span>
      </button>
    </div>
  );
}
