import { useEffect, useMemo, useState } from "react";
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

import EliminacionAuthGate, {
  useEliminacionSupabaseSession,
} from "./EliminacionAuthGate";

import "./BusquedayEliminacion.css";

const CEDULAS_ADMIN = ["1037670182", "1037649258"];
const FOTOS_BUCKET = "fotos_pacientes";

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
      "numero_documento_fisico, sesion_tipo, fotos, videos, zonas_evaluadas, created_at, updated_at",
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

function normalizarCedula(valor) {
  return String(valor ?? "")
    .replace(/\D/g, "")
    .trim();
}

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

const SIGNED_URL_TTL_SEG = 7200;
const SIGNED_URL_MAX_INTENTOS = 3;

const MSG_SIN_SESION_AUTH =
  "No hay sesión de Supabase Auth en este navegador. Las miniaturas usan enlaces firmados: entra al módulo de fotos (/herramientas/fotos-test), inicia sesión con correo y contraseña, y vuelve a esta página.";

function delayMs(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function esErrorTransitorioSignedUrl(error) {
  const msg = String(error?.message || "").toLowerCase();
  const status = error?.statusCode ?? error?.status;
  if (status === 502 || status === 503 || status === 504) return true;
  if (msg.includes("502") || msg.includes("503") || msg.includes("504"))
    return true;
  if (msg.includes("bad gateway") || msg.includes("gateway timeout"))
    return true;
  if (msg.includes("service unavailable")) return true;
  return false;
}

async function crearSignedUrlConReintentos(storagePath, ttlSegundos) {
  let ultimoError = null;

  for (let intento = 0; intento < SIGNED_URL_MAX_INTENTOS; intento += 1) {
    const { data, error } = await supabase.storage
      .from(FOTOS_BUCKET)
      .createSignedUrl(storagePath, ttlSegundos);

    if (!error && data?.signedUrl) {
      return { data, error: null };
    }

    ultimoError = error;

    if (
      intento < SIGNED_URL_MAX_INTENTOS - 1 &&
      error &&
      esErrorTransitorioSignedUrl(error)
    ) {
      await delayMs(500 * (intento + 1));
    } else {
      break;
    }
  }

  return { data: null, error: ultimoError };
}

function mensajeFalloSignedUrl(error) {
  const raw = String(error?.message || error || "").trim();
  const lower = raw.toLowerCase();

  if (
    lower.includes("502") ||
    lower.includes("bad gateway") ||
    lower.includes("503") ||
    lower.includes("504") ||
    lower.includes("gateway timeout")
  ) {
    return (
      (raw || "502 Bad Gateway") +
      ". Es un fallo del lado del servidor de Supabase o de la red (no de permisos). " +
      "Reintenta en unos segundos o vuelve a pulsar Buscar; si persiste, revisa el estado del servicio en supabase.com/status."
    );
  }

  const sugiereRls =
    !raw ||
    lower.includes("policy") ||
    lower.includes("permission") ||
    lower.includes("denied") ||
    lower.includes("not authorized") ||
    lower.includes("jwt") ||
    raw === "Object not found";

  const extra = sugiereRls
    ? " Revisa en Supabase (Storage → políticas del bucket) que el rol authenticated tenga permiso de lectura en los objetos."
    : "";

  return (raw || "No se pudo generar el enlace de vista previa.") + extra;
}

function listarEntradasMedia(obj, kind) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return [];

  return Object.entries(obj)
    .map(([tipo, meta]) => {
      const storage_path = meta?.storage_path
        ? limpiarPathStorage(meta.storage_path)
        : "";
      const public_url =
        typeof meta?.public_url === "string" && meta.public_url.trim()
          ? meta.public_url.trim()
          : "";

      return {
        key: `${kind}:${tipo}`,
        tipo,
        kind,
        nombre: meta?.nombre_archivo || tipo,
        storage_path,
        public_url,
        mime: String(meta?.mime_type || ""),
      };
    })
    .filter((e) => e.storage_path || e.public_url);
}

function esRutaSimulacion(path) {
  return String(path || "")
    .toLowerCase()
    .startsWith("simulacion/");
}

function EvidenciasPreviewBlock({ fotos, videos, authRevision = "" }) {
  const sesionDesdeGate = useEliminacionSupabaseSession();

  const entries = useMemo(
    () => [
      ...listarEntradasMedia(fotos, "foto"),
      ...listarEntradasMedia(videos, "video"),
    ],
    [fotos, videos],
  );

  const [resolved, setResolved] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!entries.length) {
      setResolved([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setResolved([]);

    async function resolver() {
      setLoading(true);
      const out = [];

      try {
        const { data: fresh } = await supabase.auth.getSession();
        const sessionEfectiva = sesionDesdeGate ?? fresh?.session ?? null;
        const puedeFirmarUrls = Boolean(sessionEfectiva);

        for (const e of entries) {
          if (cancelled) return;

          let src = e.public_url || "";
          let errMsg = "";

          if (e.storage_path && esRutaSimulacion(e.storage_path)) {
            errMsg = "Simulación (sin archivo en storage)";
          } else if (!src && e.storage_path) {
            if (!puedeFirmarUrls) {
              errMsg = MSG_SIN_SESION_AUTH;
            } else {
              const { data, error } = await crearSignedUrlConReintentos(
                e.storage_path,
                SIGNED_URL_TTL_SEG,
              );

              if (error) {
                errMsg = mensajeFalloSignedUrl(error);
              } else if (data?.signedUrl) {
                src = data.signedUrl;
              }
            }
          }

          if (!src && !errMsg) {
            errMsg = "Sin ruta ni URL pública";
          }

          out.push({ ...e, src, errMsg });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }

      if (!cancelled) {
        setResolved(out);
      }
    }

    resolver();

    return () => {
      cancelled = true;
      setLoading(false);
    };
  }, [entries, authRevision, sesionDesdeGate]);

  if (!entries.length) {
    return null;
  }

  return (
    <div className="eliminacion-evidencias">
      <p className="eliminacion-evidencias__title">Vista previa de evidencias</p>

      {loading && resolved.length === 0 ? (
        <p className="eliminacion-evidencias__hint">Cargando imágenes y videos…</p>
      ) : null}

      <div className="eliminacion-evidencias__grid">
        {resolved.map((item) => {
          const esVideo =
            item.kind === "video" ||
            String(item.mime || "").toLowerCase().startsWith("video/");

          return (
            <figure key={item.key} className="eliminacion-evidencias__item">
              <figcaption className="eliminacion-evidencias__caption">
                <span className="eliminacion-evidencias__tipo">{item.tipo}</span>
                {item.nombre && item.nombre !== item.tipo ? (
                  <span className="eliminacion-evidencias__nombre">
                    {item.nombre}
                  </span>
                ) : null}
              </figcaption>

              {item.errMsg ? (
                <p className="eliminacion-evidencias__error">{item.errMsg}</p>
              ) : null}

              {item.src && !item.errMsg ? (
                esVideo ? (
                  <video
                    className="eliminacion-evidencias__media"
                    controls
                    playsInline
                    preload="metadata"
                    src={item.src}
                  />
                ) : (
                  <a
                    href={item.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="eliminacion-evidencias__link"
                  >
                    <img
                      className="eliminacion-evidencias__media eliminacion-evidencias__media--img"
                      src={item.src}
                      alt={item.tipo}
                      loading="lazy"
                    />
                  </a>
                )
              ) : null}

              {item.storage_path ? (
                <p className="eliminacion-evidencias__path" title={item.storage_path}>
                  {item.storage_path}
                </p>
              ) : null}
            </figure>
          );
        })}
      </div>
    </div>
  );
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
        ["Cédula", row.numero_documento_fisico || "Sin dato"],
        ["Tipo sesión", row.sesion_tipo || "Sin dato"],
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

function ResumenCard({ title, count, rows, itemKey, authRevision }) {
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

                {itemKey === "fotos_pacientes" ? (
                  <EvidenciasPreviewBlock
                    fotos={row.fotos}
                    videos={row.videos}
                    authRevision={authRevision}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

function BusquedayEliminacionContenido() {
  const navigate = useNavigate();
  const { profesional } = useProfesionalSession();
  const sesionSupabaseAuth = useEliminacionSupabaseSession();

  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [resultadoBusqueda, setResultadoBusqueda] = useState(null);

  const userName = profesional?.nombre || "Profesional";
  const cedulaProfesional = useMemo(
    () => String(profesional?.cedula || "").trim(),
    [profesional],
  );

  const autorizado = CEDULAS_ADMIN.includes(cedulaProfesional);

  const revisionAuthVistaPrevia = sesionSupabaseAuth?.user?.id
    ? String(sesionSupabaseAuth.user.id)
    : "sin-auth";

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

              <span
                className={
                  sesionSupabaseAuth
                    ? "eliminacion-chip eliminacion-chip--ok"
                    : "eliminacion-chip eliminacion-chip--auth-missing"
                }
              >
                Supabase Auth (vista previa):{" "}
                {sesionSupabaseAuth ? "sesión activa" : "sin sesión"}
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
                  authRevision={revisionAuthVistaPrevia}
                />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export default function BusquedayEliminacion() {
  return (
    <EliminacionAuthGate>
      <BusquedayEliminacionContenido />
    </EliminacionAuthGate>
  );
}
