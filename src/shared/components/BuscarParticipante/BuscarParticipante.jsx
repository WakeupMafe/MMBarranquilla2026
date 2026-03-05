import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "./BuscarParticipante.css";

export default function BuscarParticipante({
  titulo = "Logros Fase 1",
  subtitulo = "Seguimiento y registro de objetivos",
  onEncontrado,
}) {
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [encontrado, setEncontrado] = useState(null);

  const onCedulaChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, "");
    setCedula(onlyDigits);
  };

  const buscar = async () => {
    setErrorMsg("");
    setEncontrado(null);

    if (!cedula || cedula.length < 6) {
      setErrorMsg("Por favor ingresa una cédula válida (mínimo 6 dígitos).");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("participantes")
        .select("numero_documento_fisico, nombre_apellido_documento")
        .eq("numero_documento_fisico", cedula)
        .maybeSingle();

      if (error) {
        setErrorMsg("Ocurrió un error consultando la base de datos.");
        return;
      }

      if (!data) {
        setErrorMsg(
          "El usuario no existe, no puede realizar la encuesta. Por favor revise el documento e intente nuevamente.",
        );
        return;
      }

      const payload = {
        numero_documento_fisico: String(data.numero_documento_fisico),
        nombre_apellido_documento: String(
          data.nombre_apellido_documento || "",
        ).trim(),
      };

      setEncontrado(payload);

      // ✅ cache opcional por si recargas
      sessionStorage.setItem("logros_paciente", JSON.stringify(payload));

      // ✅ le avisamos al padre
      if (onEncontrado) onEncontrado(payload);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="logrosStart">
      <div className="logrosStart__cardHeader">
        <div className="logrosStart__icon">🏆</div>

        <div className="logrosStart__titles">
          <h2 className="logrosStart__title">{titulo}</h2>
          <p className="logrosStart__subtitle">{subtitulo}</p>
        </div>
      </div>

      <div className="logrosStart__panel">
        <div className="logrosStart__row">
          <input
            className="logrosStart__input"
            value={cedula}
            onChange={onCedulaChange}
            placeholder="Cédula del usuario"
            inputMode="numeric"
          />

          <button
            type="button"
            className="logrosStart__btn"
            onClick={buscar}
            disabled={loading}
          >
            {loading ? "Buscando..." : "Realizar Búsqueda"}
          </button>
        </div>

        {errorMsg ? (
          <div className="logrosStart__msg logrosStart__msg--error">
            {errorMsg}
          </div>
        ) : null}

        {encontrado ? (
          <div className="logrosStart__msg logrosStart__msg--ok">
            <b>Encontrado:</b> {encontrado.nombre_apellido_documento} —{" "}
            {encontrado.numero_documento_fisico}
          </div>
        ) : null}
      </div>
    </div>
  );
}
