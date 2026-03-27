import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./FotoUploadTest.css";
import { compressImage } from "../utils/imageCompression";
import { alertConfirm, alertError, alertOk } from "../../../shared/lib/alerts";
import { PHOTO_GROUPS } from "../constants/photoGroups";
import { VIDEO_GROUPS } from "../constants/videoGroups";
import PhotoGroupCard from "../components/PhotoGroupCard";
import BotonImportante from "../../../shared/components/BotonImportante/BotonImportante";
import { obtenerValoracionActiva } from "../../valoracion/utils/valoracionSession";
import { uploadFotoPaciente } from "../services/fotosService";
import { uploadVideoPaciente } from "../services/videosService";
import {
  FOTO_UPLOAD_MODES,
  getFotosUploadMode,
} from "../../../shared/lib/fotosUploadMode";
import { usePhotoUpload } from "../hooks/usePhotoUpload";

const SESSION_KEY = "wk_profesional";

/* =========================
   ZONAS
========================= */

function normalizarZonaProtocolo(zona) {
  const value = String(zona || "")
    .trim()
    .toLowerCase();

  if (!value) return "funcional";
  if (value.includes("hombro")) return "hombro";
  if (value.includes("rodilla")) return "rodilla";
  if (value.includes("cadera")) return "cadera";
  if (value.includes("espalda") || value.includes("lumbar")) return "lumbar";
  if (value.includes("funcional")) return "funcional";

  return "funcional";
}

function normalizarZonaVideo(zona) {
  const value = String(zona || "")
    .trim()
    .toLowerCase();

  if (!value) return "";
  if (value.includes("rodilla")) return "rodilla";
  if (value.includes("cadera")) return "cadera";
  if (value.includes("espalda") || value.includes("lumbar")) return "lumbar";
  if (value.includes("funcional")) return "funcional";

  return "";
}

function getZonaTitle(zona) {
  const labels = {
    funcional: "Funcional",
    hombro: "Hombro",
    rodilla: "Rodilla",
    cadera: "Cadera",
    lumbar: "Lumbar",
  };

  return labels[zona] || "Funcional";
}

export default function FotoUploadTest() {
  const location = useLocation();
  const navigate = useNavigate();

  const valoracionActiva = useMemo(() => obtenerValoracionActiva(), []);

  /* =========================
     ZONAS ACTIVAS
  ========================= */

  const zonasProtocoloFotos = useMemo(() => {
    const zonasDesdeState = location.state?.zonasProtocoloFotos;

    if (Array.isArray(zonasDesdeState) && zonasDesdeState.length > 0) {
      return [...new Set(zonasDesdeState.map(normalizarZonaProtocolo))];
    }

    const zonaUnica = normalizarZonaProtocolo(
      location.state?.zonaSeleccionadaFinal ||
        location.state?.zonaProtocoloFotos ||
        location.state?.resultado?.zonasDetectadas?.[0] ||
        location.state?.clasificacionPaciente?.zonaSecundaria ||
        location.state?.clasificacionPaciente?.zonaDestino ||
        valoracionActiva?.clasificacionPaciente?.zonaSecundaria ||
        valoracionActiva?.clasificacionPaciente?.zonaDestino ||
        "funcional",
    );

    return [zonaUnica];
  }, [location.state, valoracionActiva]);

  /* =========================
     GRUPOS DE FOTOS
  ========================= */

  const gruposActivos = useMemo(() => {
    if (!zonasProtocoloFotos.length) return [];

    if (zonasProtocoloFotos.includes("funcional")) {
      return PHOTO_GROUPS;
    }

    return PHOTO_GROUPS.filter((group) =>
      group.zonas?.some((zona) => zonasProtocoloFotos.includes(zona)),
    );
  }, [zonasProtocoloFotos]);

  /* =========================
     GRUPOS DE VIDEOS
  ========================= */

  const gruposVideosActivos = useMemo(() => {
    const zonasVideo = zonasProtocoloFotos
      .map(normalizarZonaVideo)
      .filter(Boolean);

    if (!zonasVideo.length) return [];

    return VIDEO_GROUPS.filter((group) =>
      group.zonas?.some((zona) => zonasVideo.includes(zona)),
    );
  }, [zonasProtocoloFotos]);

  /* =========================
     PACIENTE / PROFESIONAL
  ========================= */

  const paciente = useMemo(() => {
    return valoracionActiva?.paciente || null;
  }, [valoracionActiva]);

  const pacienteDocumento = useMemo(() => {
    return (
      valoracionActiva?.paciente?.numero_documento_fisico ||
      valoracionActiva?.paciente?.num_documento ||
      valoracionActiva?.paciente?.cedula ||
      ""
    );
  }, [valoracionActiva]);

  const profesional = useMemo(() => {
    if (location.state?.profesional) return location.state.profesional;

    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [location.state]);

  const profesionalCedula = useMemo(() => {
    return profesional?.cedula || "";
  }, [profesional]);

  /* =========================
     ESTADOS INICIALES
  ========================= */

  const createEmptyPhotos = () =>
    gruposActivos.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        groupId: group.id,
        file: null,
        preview: "",
        fileName: "",
        fileSize: 0,
        width: 0,
        height: 0,
        status: "empty",
      })),
    );

  const createEmptyVideos = () =>
    gruposVideosActivos.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        groupId: group.id,
        file: null,
        preview: "",
        fileName: "",
        fileSize: 0,
        duration: 0,
        status: "empty",
      })),
    );

  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const {
    processingId,
    setProcessingId,
    handleVideoChange,
    handleRemoveVideo,
  } = usePhotoUpload();

  /* =========================
     REINICIAR CUANDO CAMBIAN LOS GRUPOS
  ========================= */

  useEffect(() => {
    setPhotos(createEmptyPhotos());
    setVideos(createEmptyVideos());
    setProcessingId("");
  }, [gruposActivos, gruposVideosActivos, setProcessingId]);

  /* =========================
     LIMPIAR URLS DE PREVIEW AL DESMONTAR
  ========================= */

  useEffect(() => {
    return () => {
      photos.forEach((photo) => {
        if (photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });

      videos.forEach((video) => {
        if (video.preview) {
          URL.revokeObjectURL(video.preview);
        }
      });
    };
  }, [photos, videos]);

  /* =========================
     FOTO
  ========================= */

  const handlePhotoChange = async (slotId, fileList) => {
    const file = fileList?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      await alertError(
        "Archivo no válido",
        "El archivo seleccionado no es una imagen válida.",
      );
      return;
    }

    try {
      setProcessingId(slotId);

      const result = await compressImage(file, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.62,
        outputType: "image/jpeg",
      });

      setPhotos((prev) =>
        prev.map((item) => {
          if (item.id !== slotId) return item;

          if (item.preview) {
            URL.revokeObjectURL(item.preview);
          }

          return {
            ...item,
            file: result.file,
            preview: result.previewUrl,
            fileName: result.compressed?.name || result.file?.name || "",
            fileSize: result.compressed?.size || result.file?.size || 0,
            width: result.compressed?.width || 0,
            height: result.compressed?.height || 0,
            status: "ready",
          };
        }),
      );
    } catch (error) {
      await alertError(
        "Error al procesar",
        error.message || "No se pudo procesar la imagen.",
      );
    } finally {
      setProcessingId("");
    }
  };

  const handleRemovePhoto = async (slotId) => {
    const photo = photos.find((item) => item.id === slotId);

    if (!photo?.preview) return;

    const ok = await alertConfirm({
      title: "Quitar foto",
      text: `¿Deseas quitar la foto "${photo.title}"?`,
      confirmText: "Sí, quitar",
      cancelText: "Cancelar",
    });

    if (!ok) return;

    setPhotos((prev) =>
      prev.map((item) => {
        if (item.id !== slotId) return item;

        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }

        return {
          ...item,
          file: null,
          preview: "",
          fileName: "",
          fileSize: 0,
          width: 0,
          height: 0,
          status: "empty",
        };
      }),
    );
  };

  /* =========================
     LIMPIAR TODO
  ========================= */

  const handleReset = async () => {
    const hasPhotos = photos.some((item) => item.preview);
    const hasVideos = videos.some((item) => item.preview);

    if (!hasPhotos && !hasVideos) {
      await alertError(
        "Nada para limpiar",
        "Aún no has cargado fotos ni videos en el protocolo.",
      );
      return;
    }

    const ok = await alertConfirm({
      title: "Limpiar protocolo",
      text: "¿Deseas eliminar todas las fotos y videos cargados?",
      confirmText: "Sí, limpiar",
      cancelText: "Cancelar",
    });

    if (!ok) return;

    photos.forEach((item) => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });

    videos.forEach((item) => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });

    setPhotos(createEmptyPhotos());
    setVideos(createEmptyVideos());
    setProcessingId("");

    await alertOk(
      "Formulario limpiado",
      "Se reiniciaron todas las fotos y videos del protocolo.",
    );
  };

  /* =========================
     CONTADORES
  ========================= */

  const completedPhotosCount = photos.filter(
    (item) => item.status === "ready",
  ).length;

  const completedVideosCount = videos.filter(
    (item) => item.status === "ready",
  ).length;

  const totalRequiredCount = photos.length + videos.length;
  const totalCompletedCount = completedPhotosCount + completedVideosCount;

  const todoCompleto =
    totalRequiredCount > 0 && totalCompletedCount === totalRequiredCount;

  /* =========================
     AGRUPAR FOTOS + VIDEOS
     LOS VIDEOS SOLO UNA VEZ POR ZONA
  ========================= */

  const groupedFinal = useMemo(() => {
    const zonasConVideosAsignados = new Set();
    const esFuncional = zonasProtocoloFotos.includes("funcional");

    return gruposActivos.map((group, index) => {
      let videosDelGrupo = [];

      // 🔥 CASO FUNCIONAL:
      // pega todos los videos funcionales al primer grupo visible
      if (esFuncional && index === 0) {
        videosDelGrupo = videos;
      }

      // 🔥 CASO NORMAL POR ZONA:
      if (!esFuncional) {
        const zonaDelGrupo = group.zonas?.find((zona) =>
          zonasProtocoloFotos.includes(zona),
        );

        if (zonaDelGrupo && !zonasConVideosAsignados.has(zonaDelGrupo)) {
          const grupoVideo = gruposVideosActivos.find((g) =>
            g.zonas?.includes(zonaDelGrupo),
          );

          if (grupoVideo) {
            videosDelGrupo = videos.filter((video) =>
              grupoVideo.items.some((item) => item.id === video.id),
            );

            zonasConVideosAsignados.add(zonaDelGrupo);
          }
        }
      }

      return {
        ...group,
        photos: photos.filter((photo) => photo.groupId === group.id),
        videos: videosDelGrupo,
      };
    });
  }, [gruposActivos, gruposVideosActivos, photos, videos, zonasProtocoloFotos]);

  /* =========================
     VOLVER
  ========================= */

  const handleVolver = () => {
    navigate("/herramientas/anamnesis-zona", {
      state: {
        ...location.state,
      },
    });
  };

  /* =========================
     ENVIAR TODO JUNTO
  ========================= */

  const handleUpload = async () => {
    const readyPhotos = photos.filter((item) => item.status === "ready");
    const readyVideos = videos.filter((item) => item.status === "ready");

    if (totalRequiredCount === 0) {
      await alertError(
        "Sin protocolo activo",
        "No se encontraron fotos o videos requeridos para esta valoración.",
      );
      return;
    }

    if (!todoCompleto) {
      await alertError(
        "Protocolo incompleto",
        "Debes completar todas las fotos y videos requeridos antes de enviar.",
      );
      return;
    }

    if (!pacienteDocumento) {
      await alertError(
        "Paciente no identificado",
        "No se encontró la cédula del paciente en la sesión activa.",
      );
      return;
    }

    if (!profesionalCedula) {
      await alertError(
        "Profesional no identificado",
        "No se encontró la cédula del profesional para guardar la evidencia.",
      );
      return;
    }

    try {
      setUploading(true);

      const sesionTipo = `evaluacion_${zonasProtocoloFotos.join("_")}`;
      const uploadMode = getFotosUploadMode();

      for (const photo of readyPhotos) {
        await uploadFotoPaciente({
          file: photo.file,
          pacienteDocumento,
          tipoFoto: photo.id,
          sesionTipo,
          profesionalCedula,
          zonasEvaluadas: zonasProtocoloFotos,
        });
      }

      for (const video of readyVideos) {
        await uploadVideoPaciente({
          file: video.file,
          pacienteDocumento,
          tipoVideo: video.id,
          sesionTipo,
          profesionalCedula,
          zonasEvaluadas: zonasProtocoloFotos,
          duracionSegundos: video.duration || null,
        });
      }

      photos.forEach((item) => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });

      videos.forEach((item) => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });

      setPhotos(createEmptyPhotos());
      setVideos(createEmptyVideos());
      setProcessingId("");

      if (uploadMode === FOTO_UPLOAD_MODES.SIMULACION) {
        await alertOk(
          "Simulación completada",
          `Se simuló correctamente el envío de ${readyPhotos.length} foto(s) y ${readyVideos.length} video(s). No se guardó nada en base de datos.`,
        );
      } else {
        await alertOk(
          "Evidencia guardada",
          `Se guardaron correctamente ${readyPhotos.length} foto(s) y ${readyVideos.length} video(s).`,
        );
      }

      navigate("/herramientas/valoracion/check-in");
    } catch (error) {
      await alertError(
        "Error al enviar",
        error.message || "No se pudo completar el envío a base de datos.",
      );
    } finally {
      setUploading(false);
    }
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="photoTestPage">
      <div className="photoTestWrapper">
        <section className="photoCard">
          <div className="photoHeaderTop">
            <BotonImportante
              type="button"
              variant="outline"
              onClick={handleVolver}
              disabled={uploading || processingId !== ""}
            >
              ← Volver
            </BotonImportante>
          </div>

          <h1 className="photoTitle">Fotos + Videos clínicos</h1>

          <p className="photoSubtitle">
            Protocolo activo para las zonas{" "}
            <strong>{zonasProtocoloFotos.map(getZonaTitle).join(", ")}</strong>.
            Registra únicamente las evidencias requeridas para esta fase
            clínica.
          </p>

          <div className="photoSessionInfo">
            <p>
              <strong>Paciente activo:</strong>{" "}
              {paciente?.nombre_apellido_documento || "No disponible"}
            </p>
            <p>
              <strong>Cédula:</strong> {pacienteDocumento || "No disponible"}
            </p>
          </div>
        </section>

        <section className="photoCard">
          <div className="photoForm">
            <p className="fieldHelp">
              Fotos completadas: <strong>{completedPhotosCount}</strong> de{" "}
              <strong>{photos.length}</strong>
            </p>

            <p className="fieldHelp">
              Videos completados: <strong>{completedVideosCount}</strong> de{" "}
              <strong>{videos.length}</strong>
            </p>

            <p className="fieldHelp">
              Total completado: <strong>{totalCompletedCount}</strong> de{" "}
              <strong>{totalRequiredCount}</strong>
            </p>

            <div className="actions">
              <BotonImportante
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={processingId !== "" || uploading}
              >
                Limpiar todo
              </BotonImportante>

              <BotonImportante
                type="button"
                onClick={handleUpload}
                disabled={
                  uploading ||
                  processingId !== "" ||
                  !todoCompleto ||
                  totalRequiredCount === 0
                }
              >
                {uploading ? "Enviando..." : "Enviar a base de datos"}
              </BotonImportante>
            </div>
          </div>
        </section>

        <div className="photoGroupsList">
          {groupedFinal.map((group) => (
            <PhotoGroupCard
              key={group.id}
              group={group}
              photos={group.photos}
              videos={group.videos}
              processingId={processingId}
              onPhotoChange={handlePhotoChange}
              onRemovePhoto={handleRemovePhoto}
              onVideoChange={(slotId, fileList) =>
                handleVideoChange(slotId, fileList, setVideos)
              }
              onRemoveVideo={(slotId) =>
                handleRemoveVideo(slotId, videos, setVideos)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
