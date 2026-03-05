import { useNavigate } from "react-router-dom";

export default function Logros2() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <button className="back" onClick={() => navigate("/herramientas")}>
        ← Volver
      </button>
      <h1 className="title">Encuesta Logros 2</h1>
      <p className="subtitle">Pantalla base (luego ponemos el formulario)</p>
    </div>
  );
}
