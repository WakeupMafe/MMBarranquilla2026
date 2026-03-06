import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import logoWakeup from "../../../assets/LogoWakeup.png";

import useLogros1Catalog from "./hooks/useLogros1Catalog";
import useLogros1Form from "./hooks/useLogros1Form";

import { OBJETIVOS } from "./data/logros1Objetivos";

import { buildLogros1Payload } from "./utils/logros1Mapper";

import {
  saveLogros1,
  incrementProfesionalEncuestas,
} from "../servives/logros1Service";
import "./Logros1.css";

const SESSION_KEY = "wk_profesional";

/* =========================
   UI helpers (solo UI)
   ========================= */
function RadioGroup({ label, name, options, value, onChange }) {
  return (
    <div className="field">
      <p className="field__label">{label}</p>
      <div className="field__grid">
        {options.map((opt) => (
          <label className="option" key={opt.value}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CheckboxGroup({ label, options, values, onToggle, note }) {
  return (
    <div className="field">
      <p className="field__label">{label}</p>
      {note ? <p className="field__note">{note}</p> : null}

      <div className="field__grid">
        {options.map((opt) => (
          <label className="option" key={opt.value}>
            <input
              type="checkbox"
              checked={values.includes(opt.value)}
              onChange={() => onToggle(opt.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Selecciona...",
}) {
  return (
    <div className="field">
      <p className="field__label">{label}</p>
      <select className="select" value={value} onChange={onChange}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =========================
   PAGE
   ========================= */
export default function Logros1() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    limitacionMoverseOptions,
    actividadesAfectadasOptions,
    sintomasOptions,
  } = useLogros1Catalog();

  const {
    form,
    setForm,
    toggleActividad,
    toggleSintoma,
    setObjetivo,
    objetivosAResponder,
    reset,
  } = useLogros1Form();

  const [submitting, setSubmitting] = useState(false);

  // paciente: state -> cache
  const paciente = useMemo(() => {
    const fromState = location.state?.paciente;
    if (fromState) return fromState;
    try {
      const raw = sessionStorage.getItem("logros_paciente");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [location.state]);

  // profesional: state -> cache
  const profesional = useMemo(() => {
    const fromState = location.state?.profesional;
    if (fromState) return fromState;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [location.state]);

  // protección de acceso: si falta profesional, rebotar
  useEffect(() => {
    if (!profesional) {
      alertError(
        "Acceso restringido",
        "Debes iniciar sesión para acceder a Logros 1.",
      );
      navigate("/", { replace: true });
    }
  }, [profesional, navigate]);

  if (!paciente || !profesional) {
    return (
      <div className="page">
        <div className="logrosBox">
          <h2>Faltan datos</h2>
          <p>Vuelve a Herramientas y entra de nuevo a Logros 1.</p>
          <button
            className="btn-volverherramientas"
            onClick={() => navigate("/herramientas")}
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  const userName = profesional.nombre;

  const onSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validaciones mínimas (SweetAlert)
    if (!form.limitacion_moverse) {
      await alertError(
        "Faltan datos",
        "Selecciona la limitación para moverse.",
      );
      return;
    }

    if (form.sintomas_top.length < 1) {
      await alertError("Faltan datos", "Selecciona mínimo 1 síntoma.");
      return;
    }

    if (form.sintomas_top.includes("otro") && !form.otro_sintoma.trim()) {
      await alertError("Faltan datos", "Escribe el otro síntoma.");
      return;
    }

    for (const s of objetivosAResponder) {
      if (!form.objetivos[s]) {
        await alertError(
          "Faltan datos",
          "Selecciona un objetivo para cada síntoma elegido.",
        );
        return;
      }
    }

    // seguridad extra: nombre completo no puede ir vacío
    const nombreCompleto = String(
      paciente.nombre_apellido_documento || "",
    ).trim();
    if (!nombreCompleto) {
      await alertError(
        "Paciente inválido",
        "No se encontró el nombre completo del paciente en participantes.",
      );
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = buildLogros1Payload({
        paciente,
        profesional,
        form,
      });

      await saveLogros1(payload);

      // best-effort (si falla, no rompemos el flujo)
      try {
        await incrementProfesionalEncuestas(profesional.cedula);
      } catch {
        // no-op
      }

      await alertOk(
        "Envío exitoso",
        "La encuesta fue enviada correctamente ✅",
      );

      reset();
      navigate("/herramientas/logros-1");
    } catch (err) {
      await alertError(
        "No se pudo enviar",
        err?.message || "Ocurrió un error enviando la encuesta.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <TopHeader userName={userName} logoSrc={logoWakeup} />

      <div className="logrosBox">
        <button
          className="back"
          type="button"
          onClick={() => navigate("/herramientas/logros-1")}
        >
          ← Volver
        </button>

        <h1 className="title">Encuesta Logros 1</h1>
        <p className="subtitle">
          Paciente: <b>{paciente.nombre_apellido_documento}</b> —{" "}
          {paciente.numero_documento_fisico}
        </p>

        <form onSubmit={onSubmit} className="form">
          {/* P4 */}
          <RadioGroup
            label="1. ¿Qué tan limitada está su vida para moverse?"
            name="limitacion_moverse"
            options={limitacionMoverseOptions}
            value={form.limitacion_moverse}
            onChange={(e) =>
              setForm((p) => ({ ...p, limitacion_moverse: e.target.value }))
            }
          />

          {/* P5 */}
          <CheckboxGroup
            label="2. ¿Qué actividades de la vida diaria se ven afectadas por su limitación?"
            note="(Puede elegir todas las que apliquen)"
            options={actividadesAfectadasOptions}
            values={form.actividades_afectadas}
            onToggle={toggleActividad}
          />

          {/* P6 */}
          <CheckboxGroup
            label="3. Elija los 3 problemas/síntomas más importantes"
            note="(Seleccione mínimo 1 y máximo 3)"
            options={sintomasOptions}
            values={form.sintomas_top}
            onToggle={toggleSintoma}
          />

          {/* Otro síntoma */}
          {form.sintomas_top.includes("otro") ? (
            <div className="field">
              <p className="field__label">Si marcó “Otro”, escriba cuál</p>
              <input
                className="input"
                value={form.otro_sintoma}
                onChange={(e) =>
                  setForm((p) => ({ ...p, otro_sintoma: e.target.value }))
                }
                placeholder="Escriba el otro síntoma"
              />
            </div>
          ) : null}

          <hr className="sep" />

          <h2 className="sectionTitle">Objetivos</h2>

          {objetivosAResponder.length === 0 ? (
            <p className="hint">
              Seleccione al menos un síntoma (que no sea “Otro”) para ver
              objetivos.
            </p>
          ) : (
            objetivosAResponder.map((s) => {
              const meta = OBJETIVOS[s];
              if (!meta) return null;

              const sintomaLabel =
                sintomasOptions.find((x) => x.value === s)?.label || s;

              return (
                <div className="objetivoCard" key={s}>
                  <p className="objetivoCard__title">{sintomaLabel}</p>
                  <p className="objetivoCard__subtitle">
                    {meta.objetivoGeneral}
                  </p>

                  <Select
                    label="Objetivo específico"
                    value={form.objetivos[s] || ""}
                    onChange={(e) => setObjetivo(s, e.target.value)}
                    options={meta.opciones}
                  />
                </div>
              );
            })
          )}

          <div className="field">
            <p className="field__label">Objetivo extra (opcional)</p>
            <input
              className="input"
              value={form.objetivo_extra}
              onChange={(e) =>
                setForm((p) => ({ ...p, objetivo_extra: e.target.value }))
              }
              placeholder="Escriba un objetivo adicional (opcional)"
            />
          </div>

          <div className="field">
            <p className="field__label">
              ¿Hay algo adicional que ahora no puede hacer? (opcional)
            </p>
            <input
              className="input"
              value={form.adicional_no_puede}
              onChange={(e) =>
                setForm((p) => ({ ...p, adicional_no_puede: e.target.value }))
              }
              placeholder="Escriba aquí (opcional)"
            />
          </div>

          <div className="actions">
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
