import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../../../../shared/lib/supabaseClient";
import useProfesionalSession from "../../../../../shared/hooks/useProfesionalSession";
import {
  alertConfirm,
  alertError,
  alertOk,
} from "../../../../../shared/lib/alerts";

import TopHeader from "../../../../../shared/components/TopHeader/TopHeader";
import BotonImportante from "../../../../../shared/components/BotonImportante/BotonImportante";
import logoWakeup from "../../../../../assets/LogoWakeup.png";

import "./BusquedayEliminacion.css";

const FOTOS_BUCKET = "fotos_pacientes";

function normalizarCedula(valor) {
  return String(valor ?? "")
    .replace(/\D/g, "")
    .trim();
}

// 🔹 admins permitidos normalizados
const CEDULAS_ADMIN = ["1037670182", "1037649258"].map(normalizarCedula);

const TABLAS_BUSQUEDA = [
  {
    key: "checkin",
    label: "Check-In",
    table: "checkin_anamnesis",
    column: "numero_documento_fisico",
    fields:
      "created_at, habeas_data, autorizacion_imagen, paciente_nombre, numero_documento_fisico, seguridad_social, instructor_nombre, lugar_valoracion",
  },
  {
    key: "obesidad",
    label: "Módulo obesidad",
    table: "modulo_obesidad",
    column: "numero_documento_fisico",
    fields: "numero_documento_fisico, created_at",
  },
  {
    key: "anamnesis_global",
    label: "Anamnesis global",
    table: "anamnesis_global",
    column: "numero_documento_fisico",
    fields:
      "numero_documento_fisico, created_at, siguiente_paso, zonas_detectadas, mensaje_resultado",
  },
  {
    key: "anamnesis_hombro",
    label: "Anamnesis hombro",
    table: "anamnesis_hombro",
    column: "numero_documento_fisico",
    fields: "numero_documento_fisico, created_at",
  },
  {
    key: "anamnesis_cadera",
    label: "Anamnesis cadera",
    table: "anamnesis_cadera",
    column: "numero_documento_fisico",
    fields: "numero_documento_fisico, created_at",
  },
  {
    key: "anamnesis_rodilla",
    label: "Anamnesis rodilla",
    table: "anamnesis_rodilla",
    column: "numero_documento_fisico",
    fields: "numero_documento_fisico, created_at",
  },
  {
    key: "anamnesis_lumbar",
    label: "Anamnesis lumbar",
    table: "anamnesis_lumbar",
    column: "numero_documento_fisico",
    fields: "numero_documento_fisico, created_at",
  },
  {
    key: "fotos_pacientes",
    label: "Fotos paciente",
    table: "fotos_pacientes",
    column: "numero_documento_fisico",
    fields:
      "id, numero_documento_fisico, fotos, videos, zonas_evaluadas, created_at, updated_at",
  },
];

const ORDEN_ELIMINACION = [
  "fotos_pacientes",
  "anamnesis_hombro",
  "anamnesis_cadera",
  "anamnesis_rodilla",
  "anamnesis_lumbar",
  "anamnesis_global",
  "obesidad",
  "checkin",
];

function formatearFecha(valor) {
  if (!valor) return "Sin fecha";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return String(valor);
  return fecha.toLocaleString("es-CO");
}

function limpiarPathStorage(path) {
  return String(path ?? "")
    .replace(/^\/+/, "")
    .trim();
}

function textoBooleano(valor) {
  if (valor === true) return "Sí";
  if (valor === false) return "No";
  return "Sin dato";
}

function extraerPathsStorageDesdeJson(valor, acumulado = []) {
  if (!valor) return acumulado;

  if (Array.isArray(valor)) {
    for (const item of valor) {
      extraerPathsStorageDesdeJson(item, acumulado);
    }
    return acumulado;
  }

  if (typeof valor === "object") {
    for (const [key, contenido] of Object.entries(valor)) {
      const keyNormalizada = String(key).toLowerCase();

      if (
        [
          "storage_path",
          "storagepath",
          "path",
          "filepath",
          "fullpath",
          "objectpath",
          "url_path",
        ].includes(keyNormalizada) &&
        typeof contenido === "string"
      ) {
        acumulado.push(contenido);
      } else {
        extraerPathsStorageDesdeJson(contenido, acumulado);
      }
    }
  }

  return acumulado;
}

function construirItemsResumen(key, row) {
  switch (key) {
    case "checkin":
      return [
        ["Paciente", row.paciente_nombre || "Sin dato"],
        ["Cédula", row.numero_documento_fisico || "Sin dato"],
        ["Instructor", row.instructor_nombre || "Sin dato"],
        ["Lugar", row.lugar_valoracion || "Sin dato"],
        ["Seguridad social", row.seguridad_social || "Sin dato"],
        ["Habeas data", textoBooleano(row.habeas_data)],
        ["Autorización imagen", textoBooleano(row.autorizacion_imagen)],
        ["Fecha", formatearFecha(row.created_at)],
      ];

    case "obesidad":
      return [
        ["Cédula", row.numero_documento_fisico || "Sin dato"],
        ["Fecha", formatearFecha(row.created_at)],
      ];

    case "anamnesis_global":
      return [
        ["Cédula", row.numero_documento_fisico || "Sin dato"],
        ["Siguiente paso", row.siguiente_paso || "Sin dato"],
        [
          "Zonas detectadas",
          Array.isArray(row.zonas_detectadas) && row.zonas_detectadas.length
            ? row.zonas_detectadas.join(", ")
            : "Sin dato",
        ],
        ["Resultado", row.mensaje_resultado || "Sin dato"],
        ["Fecha", formatearFecha(row.created_at)],
      ];

    case "anamnesis_hombro":
    case "anamnesis_cadera":
    case "anamnesis_rodilla":
    case "anamnesis_lumbar":
      return [
        ["Cédula", row.numero_documento_fisico || "Sin dato"],
        ["Fecha", formatearFecha(row.created_at)],
      ];

    case "fotos_pacientes":
      return [
        ["ID", row.id || "Sin dato"],
        ["Cédula", row.numero_documento_fisico || "Sin dato"],
        [
          "Zonas evaluadas",
          Array.isArray(row.zonas_evaluadas) && row.zonas_evaluadas.length
            ? row.zonas_evaluadas.join(", ")
            : "Sin dato",
        ],
        [
          "Cantidad fotos",
          Array.isArray(row.fotos)
            ? row.fotos.length
            : row.fotos && typeof row.fotos === "object"
              ? Object.keys(row.fotos).length
              : 0,
        ],
        [
          "Cantidad videos",
          Array.isArray(row.videos)
            ? row.videos.length
            : row.videos && typeof row.videos === "object"
              ? Object.keys(row.videos).length
              : 0,
        ],
        ["Creado", formatearFecha(row.created_at)],
        ["Actualizado", formatearFecha(row.updated_at)],
      ];

    default:
      return Object.entries(row || {}).map(([label, value]) => [
        label,
        value == null || value === "" ? "Sin dato" : String(value),
      ]);
  }
}

async function consultarTabla(config, cedula) {
  const query = supabase
    .from(config.table)
    .select(config.fields)
    .eq(config.column, cedula)
    .order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error(`Error consultando ${config.table}:`, error);
    throw new Error(
      error.message || `No fue posible consultar la tabla ${config.table}.`,
    );
  }

  return Array.isArray(data) ? data : [];
}

async function buscarTodoPorCedula(cedula) {
  const resultados = {};

  for (const config of TABLAS_BUSQUEDA) {
    const registros = await consultarTabla(config, cedula);
    resultados[config.key] = {
      ...config,
      count: registros.length,
      rows: registros,
    };
  }

  return resultados;
}

async function eliminarArchivosStorage(paths) {
  const unicos = [...new Set(paths.map(limpiarPathStorage).filter(Boolean))];

  if (!unicos.length) {
    return [];
  }

  console.log("🧨 Eliminando archivos de storage:", unicos);

  const { error } = await supabase.storage.from(FOTOS_BUCKET).remove(unicos);

  if (error) {
    console.error("Error eliminando archivos del storage:", error);
    throw new Error(
      error.message ||
        "No fue posible eliminar uno o más archivos del storage de fotos.",
    );
  }

  console.log("✅ Archivos eliminados del storage:", unicos);
  return unicos;
}

async function eliminarTabla(config, cedula) {
  console.log(
    `🧨 Eliminando registros en ${config.table} donde ${config.column} = ${cedula}`,
  );

  const { error } = await supabase
    .from(config.table)
    .delete()
    .eq(config.column, cedula);

  if (error) {
    console.error(`Error eliminando en ${config.table}:`, error);
    throw new Error(
      error.message || `No fue posible eliminar registros en ${config.table}.`,
    );
  }

  console.log(`✅ Eliminación completada en ${config.table} para ${cedula}`);
}

function ResumenCard({ title, count, rows, itemKey }) {
  return (
    <article className="eliminacion-card">
      <div className="eliminacion-card__header">
        <h3 className="eliminacion-card__title">{title}</h3>
        <span className="eliminacion-card__badge">{count}</span>
      </div>

      {count === 0 ? (
        <p className="eliminacion-card__empty">Sin registros encontrados.</p>
      ) : (
        <div className="eliminacion-card__list">
          {rows.map((row, index) => {
            const items = construirItemsResumen(itemKey, row);

            return (
              <div key={`${title}-${index}`} className="eliminacion-record">
                <ul className="eliminacion-record__items">
                  {items.map(([label, value]) => (
                    <li
                      key={`${label}-${index}`}
                      className="eliminacion-record__item"
                    >
                      <span className="eliminacion-record__label">{label}</span>
                      <span className="eliminacion-record__value">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

export default function BusquedayEliminacion() {
  const navigate = useNavigate();
  const { profesional } = useProfesionalSession();

  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [resultadoBusqueda, setResultadoBusqueda] = useState(null);

  const userName = profesional?.nombre || "Profesional";

  // 🔹 toma varios campos posibles y normaliza
  const cedulaProfesional = useMemo(() => {
    return normalizarCedula(
      profesional?.cedula ||
        profesional?.numero_documento_fisico ||
        profesional?.numero_documento ||
        profesional?.documento ||
        "",
    );
  }, [profesional]);

  const autorizado = CEDULAS_ADMIN.includes(cedulaProfesional);

  // 🔹 log corto para depurar acceso
  console.log("admin acceso:", {
    profesional,
    cedulaProfesional,
    autorizado,
  });

  const totalRegistros = useMemo(() => {
    if (!resultadoBusqueda) return 0;
    return Object.values(resultadoBusqueda).reduce(
      (acc, item) => acc + Number(item?.count || 0),
      0,
    );
  }, [resultadoBusqueda]);

  const handleBuscar = async () => {
    const cedulaNormalizada = normalizarCedula(cedula);

    if (!cedulaNormalizada) {
      await alertError(
        "Cédula requerida",
        "Debes ingresar una cédula válida para realizar la búsqueda.",
      );
      return;
    }

    setLoading(true);

    try {
      const resultados = await buscarTodoPorCedula(cedulaNormalizada);
      setResultadoBusqueda(resultados);

      await alertOk(
        "Búsqueda completada",
        `Se revisaron los registros asociados a la cédula ${cedulaNormalizada}.`,
      );
    } catch (error) {
      await alertError(
        "Error consultando registros",
        error?.message ||
          "No fue posible consultar los registros del paciente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarTodo = async () => {
    const cedulaNormalizada = normalizarCedula(cedula);

    if (!cedulaNormalizada) {
      await alertError(
        "Cédula requerida",
        "Debes ingresar una cédula válida antes de eliminar registros.",
      );
      return;
    }

    const ok = await alertConfirm({
      title: "Eliminar registros del paciente",
      text: `Se eliminarán todos los registros encontrados para la cédula ${cedulaNormalizada}, incluyendo fotos en base de datos y archivos en storage. ¿Deseas continuar?`,
      confirmText: "Sí, eliminar todo",
      cancelText: "Cancelar",
    });

    if (!ok) return;

    setEliminando(true);

    try {
      const resultadosActuales = await buscarTodoPorCedula(cedulaNormalizada);

      const fotosRows = resultadosActuales.fotos_pacientes?.rows || [];
      const pathsStorage = fotosRows.flatMap((row) => {
        const pathsFotos = extraerPathsStorageDesdeJson(row?.fotos);
        const pathsVideos = extraerPathsStorageDesdeJson(row?.videos);
        return [...pathsFotos, ...pathsVideos];
      });

      console.log("📦 Registros fotos_pacientes encontrados:", fotosRows);
      console.log(
        "🧭 Paths detectados para eliminar en storage:",
        pathsStorage,
      );

      if (pathsStorage.length) {
        await eliminarArchivosStorage(pathsStorage);
      }

      for (const key of ORDEN_ELIMINACION) {
        const item = resultadosActuales[key];

        if (!item || !item.count) continue;

        await eliminarTabla(item, cedulaNormalizada);
      }

      const resultadosDespues = await buscarTodoPorCedula(cedulaNormalizada);
      setResultadoBusqueda(resultadosDespues);

      await alertOk(
        "Eliminación completada",
        `Se eliminaron todos los registros encontrados para la cédula ${cedulaNormalizada}.`,
      );
    } catch (error) {
      await alertError(
        "Error eliminando registros",
        error?.message ||
          "No fue posible eliminar todos los registros del paciente.",
      );
    } finally {
      setEliminando(false);
    }
  };

  if (!profesional) {
    return null;
  }

  if (!autorizado) {
    return (
      <div className="page">
        <TopHeader
          userName={userName}
          logoSrc={logoWakeup}
          onLogout={() => navigate("/herramientas")}
        />

        <div className="eliminacion-page">
          <section className="eliminacion-shell">
            <div className="eliminacion-panel">
              <h2 className="eliminacion-title">Acceso restringido</h2>
              <p className="eliminacion-description">
                Esta herramienta de eliminación masiva solo está habilitada para
                el usuario administrador autorizado.
              </p>

              <BotonImportante onClick={() => navigate("/herramientas")}>
                Volver
              </BotonImportante>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <TopHeader
        userName={userName}
        logoSrc={logoWakeup}
        onLogout={() => navigate("/herramientas")}
      />

      <div className="eliminacion-page">
        <section className="eliminacion-shell">
          <div className="eliminacion-panel">
            <button
              type="button"
              onClick={() => navigate("/herramientas")}
              className="eliminacion-back"
            >
              ← Volver
            </button>

            <h1 className="eliminacion-title">
              Búsqueda y eliminación por error
            </h1>
            <p className="eliminacion-description">
              Consulta todos los registros asociados a una cédula y elimina en
              un solo paso la información clínica y las fotos almacenadas del
              paciente.
            </p>

            <div className="eliminacion-actions">
              <input
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Ingresa la cédula del paciente"
                className="eliminacion-input"
              />

              <BotonImportante onClick={handleBuscar} disabled={loading}>
                {loading ? "Buscando..." : "Buscar registros"}
              </BotonImportante>

              <BotonImportante
                variant="outline"
                onClick={handleEliminarTodo}
                disabled={
                  eliminando || !resultadoBusqueda || totalRegistros === 0
                }
              >
                {eliminando ? "Eliminando..." : "Eliminar todos los registros"}
              </BotonImportante>
            </div>

            <div className="eliminacion-chips">
              <span className="eliminacion-chip">
                Cédula: {normalizarCedula(cedula) || "—"}
              </span>

              <span className="eliminacion-chip">
                Total registros encontrados: {totalRegistros}
              </span>

              <span className="eliminacion-chip eliminacion-chip--warning">
                Bucket fotos: {FOTOS_BUCKET}
              </span>
            </div>
          </div>

          {resultadoBusqueda ? (
            <div className="eliminacion-grid">
              {Object.values(resultadoBusqueda).map((item) => (
                <ResumenCard
                  key={item.key}
                  title={item.label}
                  count={item.count}
                  rows={item.rows}
                  itemKey={item.key}
                />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
