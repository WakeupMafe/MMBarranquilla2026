import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "./LogrosFase1Viewer.css";

import { SINTOMAS } from "../../../features/logros1/pages/data/logros1Catalog";
import { OBJETIVOS } from "../../../features/logros1/pages/data/logros1Objetivos";

export default function LogrosFase1Viewer({ paciente }) {
  const [loading, setLoading] = useState(false);
  const [row, setRow] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const cedula = useMemo(
    () => Number(paciente?.numero_documento_fisico || 0),
    [paciente],
  );

  useEffect(() => {
    const run = async () => {
      if (!cedula) return;

      setLoading(true);
      setError("");
      setRow(null);
      setOpen(false);

      try {
        const { data, error } = await supabase
          .from("logros_fase1")
          .select(
            "created_at, nombre_completo, cedula, limitacion_moverse, actividades_afectadas, sintoma_1, sintoma_2, sintoma_3, otro_sintoma, objetivo_1, objetivo_2, objetivo_3, objetivo_extra, adicional_no_puede, encuestador",
          )
          .eq("cedula", cedula)
          .maybeSingle();

        if (error) {
          setError("No se pudo cargar la encuesta de Logros Fase 1.");
          return;
        }

        setRow(data || null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [cedula]);

  const totalObjetivos = useMemo(() => {
    if (!row) return 0;
    const base = [row.objetivo_1, row.objetivo_2, row.objetivo_3].filter(
      Boolean,
    ).length;
    const extra = row.objetivo_extra ? 1 : 0;
    return base + extra;
  }, [row]);

  const actividades = useMemo(() => {
    if (!row?.actividades_afectadas) return [];
    try {
      const parsed = JSON.parse(row.actividades_afectadas);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [row]);

  const getSintomaLabel = (value) => {
    if (!value) return "-";
    const found = SINTOMAS.find((s) => s.value === value);
    return found?.label || value;
  };

  const getObjetivoLabel = (sintomaValue, objetivoValue) => {
    if (!objetivoValue) return "-";
    const meta = OBJETIVOS[sintomaValue];
    if (!meta) return objetivoValue;

    const found = meta.opciones.find((o) => o.value === objetivoValue);
    return found?.label || objetivoValue;
  };

  const sintomasConObjetivos = useMemo(() => {
    if (!row) return [];

    const items = [
      {
        numero: 1,
        sintomaValue: row.sintoma_1,
        objetivoValue: row.objetivo_1,
      },
      {
        numero: 2,
        sintomaValue: row.sintoma_2,
        objetivoValue: row.objetivo_2,
      },
      {
        numero: 3,
        sintomaValue: row.sintoma_3,
        objetivoValue: row.objetivo_3,
      },
    ].filter((item) => item.sintomaValue);

    return items.map((item) => ({
      numero: item.numero,
      sintoma: getSintomaLabel(item.sintomaValue),
      objetivo: getObjetivoLabel(item.sintomaValue, item.objetivoValue),
    }));
  }, [row]);

  if (!paciente) return null;

  return (
    <div className="lf1">
      <div className="lf1__table">
        <div className="lf1__head">
          <div className="lf1__th">Nombre Completo</div>
          <div className="lf1__th">Total de Objetivos</div>
          <div className="lf1__th">Opciones</div>
        </div>

        <div className="lf1__row">
          <div className="lf1__td">
            {row?.nombre_completo || paciente.nombre_apellido_documento}
          </div>

          <div className="lf1__td lf1__center">
            {loading ? "..." : totalObjetivos}
          </div>

          <div className="lf1__td lf1__center">
            <button
              type="button"
              className="lf1__btn"
              disabled={loading || !row}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "Ocultar" : "Visualizar"}
            </button>
          </div>
        </div>
      </div>

      {error ? <div className="lf1__error">{error}</div> : null}

      {open && row ? (
        <div className="lf1__detail">
          <button
            type="button"
            className="lf1__toggle"
            onClick={() => setOpen(false)}
          >
            ↑ Ocultar Valoración Fisioterapia
          </button>

          <div className="lf1__card">
            <h3 className="lf1__title">Datos principales</h3>

            <div className="lf1__kv">
              <span className="lf1__k">Nombre:</span>
              <span className="lf1__v">{row.nombre_completo}</span>
            </div>

            <div className="lf1__kv">
              <span className="lf1__k"># Documento:</span>
              <span className="lf1__v">{row.cedula}</span>
            </div>

            <div className="lf1__kv">
              <span className="lf1__k">Fecha de registro:</span>
              <span className="lf1__v">
                {row.created_at ? String(row.created_at).slice(0, 10) : "-"}
              </span>
            </div>

            <div className="lf1__kv">
              <span className="lf1__k">Profesional:</span>
              <span className="lf1__v">{row.encuestador || "-"}</span>
            </div>

            <hr className="lf1__sep" />

            <h3 className="lf1__title">Resultados Logros Fase 1</h3>

            <div className="lf1__kv">
              <span className="lf1__k">Limitación para moverse:</span>
              <span className="lf1__v">{row.limitacion_moverse || "-"}</span>
            </div>

            <div className="lf1__kv">
              <span className="lf1__k">Actividades afectadas:</span>
              <span className="lf1__v">
                {actividades.length ? actividades.join(", ") : "-"}
              </span>
            </div>

            <div className="lf1__kv lf1__kv--stack">
              <span className="lf1__k">Síntomas y objetivos:</span>
              <div className="lf1__v">
                {sintomasConObjetivos.length ? (
                  <ul className="lf1__list">
                    {sintomasConObjetivos.map((item) => (
                      <li key={item.numero} className="lf1__listItem">
                        <p>
                          <b>Síntoma {item.numero}:</b> {item.sintoma}
                        </p>
                        <p>
                          <b>Objetivo {item.numero}:</b> {item.objetivo}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  "-"
                )}
              </div>
            </div>

            {row.otro_sintoma ? (
              <div className="lf1__kv">
                <span className="lf1__k">Otro síntoma:</span>
                <span className="lf1__v">{row.otro_sintoma}</span>
              </div>
            ) : null}

            {row.objetivo_extra ? (
              <div className="lf1__kv">
                <span className="lf1__k">Objetivo extra:</span>
                <span className="lf1__v">{row.objetivo_extra}</span>
              </div>
            ) : null}

            {row.adicional_no_puede ? (
              <div className="lf1__kv">
                <span className="lf1__k">Adicional no puede:</span>
                <span className="lf1__v">{row.adicional_no_puede}</span>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
