export default function ValoracionStepper({ currentStep = 1 }) {
  const steps = [
    "Check-in",
    "Datos generales",
    "Global",
    "Zonas",
    "Clasificación Final",
  ];

  return (
    <section className="valoracionStepper" aria-label="Progreso">
      {steps.map((label, index) => {
        const stepNumber = index + 1;

        let className = "stepItem";
        if (stepNumber < currentStep) className += " stepItem--completed";
        if (stepNumber === currentStep) className += " stepItem--active";

        return (
          <div key={label} className={className}>
            <span className="stepNumber">{stepNumber}</span>
            <span className="stepText">{label}</span>
          </div>
        );
      })}
    </section>
  );
}
