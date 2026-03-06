import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "./BuscarParticipante.css";
import { alertOk } from "../../../shared/lib/alerts";

export default function BuscarParticipante({
  titulo = "Logros Fase 1",
  subtitulo = "Seguimiento y registro de objetivos",
  onEncontrado,
  onYaRegistrado, // ✅ NUEVO
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
      // 1) PARTICIPANTES
      const { data: participante, error: errParticipante } = await supabase
        .from("participantes")
        .select("numero_documento_fisico, nombre_apellido_documento")
        .eq("numero_documento_fisico", cedula)
        .maybeSingle();

      if (errParticipante) {
        setErrorMsg("Ocurrió un error consultando la base de datos.");
        return;
      }

      if (!participante) {
        setErrorMsg(
          "El usuario no existe, no puede realizar la encuesta. Por favor revise el documento e intente nuevamente.",
        );
        return;
      }

      const payload = {
        numero_documento_fisico: String(participante.numero_documento_fisico),
        nombre_apellido_documento: String(
          participante.nombre_apellido_documento || "",
        ).trim(),
      };

      setEncontrado(payload);
      sessionStorage.setItem("logros_paciente", JSON.stringify(payload));

      // 2) VALIDAR SI YA EXISTE LOGROS FASE 1
      const { data: yaExiste, error: errLogros } = await supabase
        .from("logros_fase1")
        .select("cedula")
        .eq("cedula", Number(cedula))
        .maybeSingle();

      if (errLogros) {
        setErrorMsg("Ocurrió un error validando si ya existe la encuesta.");
        return;
      }

      if (yaExiste) {
        // ✅ en vez de bloquear, mostramos módulo de “visualizar”
        if (onYaRegistrado) onYaRegistrado(payload);
        return;
      }

      // 3) NO existe -> mostrar alerta y luego ir a encuesta
      await alertOk(
        "Usuario habilitado",
        "El usuario puede realizar la encuesta de Logros Fase 1.",
      );

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
