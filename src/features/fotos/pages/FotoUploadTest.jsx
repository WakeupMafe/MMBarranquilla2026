import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./FotoUploadTest.css";
import { compressImage } from "../utils/imageCompression";
import { alertConfirm, alertError } from "../../../shared/lib/alerts";
import { PHOTO_GROUPS } from "../constants/photoGroups";
import { VIDEO_GROUPS } from "../constants/videoGroups";
import PhotoGroupCard from "../components/PhotoGroupCard";
import { obtenerValoracionActiva } from "../../valoracion/utils/valoracionSession";

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
     PACIENTE
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

  /* =========================
     ESTADO INICIAL DE FOTOS
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

  /* =========================
     ESTADO INICIAL DE VIDEOS
  ========================= */

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
  const [processingId, setProcessingId] = useState("");

  /* =========================
     REINICIAR CUANDO CAMBIAN LOS GRUPOS
  ========================= */

  useEffect(() => {
    setPhotos(createEmptyPhotos());
    setVideos(createEmptyVideos());
    setProcessingId("");
  }, [gruposActivos, gruposVideosActivos]);

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
     MANEJO DE FOTO
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
        quality: 0.6,
      });

      setPhotos((prev) =>
        prev.map((p) => {
          if (p.id !== slotId) return p;

          if (p.preview) {
            URL.revokeObjectURL(p.preview);
          }

          return {
            ...p,
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
     MANEJO DE VIDEO
  ========================= */

  const getVideoDuration = (file) =>
    new Promise((resolve, reject) => {
      const tempUrl = URL.createObjectURL(file);
      const tempVideo = document.createElement("video");

      tempVideo.preload = "metadata";
      tempVideo.src = tempUrl;

      tempVideo.onloadedmetadata = () => {
        const duration = tempVideo.duration || 0;
        URL.revokeObjectURL(tempUrl);
        resolve(duration);
      };

      tempVideo.onerror = () => {
        URL.revokeObjectURL(tempUrl);
        reject(new Error("No se pudo leer la duración del video."));
      };
    });

  const handleVideoChange = async (slotId, fileList) => {
    const file = fileList?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      await alertError(
        "Archivo no válido",
        "El archivo seleccionado no es un video válido.",
      );
      return;
    }

    try {
      setProcessingId(slotId);

      const duration = await getVideoDuration(file);

      if (duration > 15) {
        await alertError(
          "Video demasiado largo",
          "El video debe durar máximo 15 segundos.",
        );
        return;
      }

      setVideos((prev) =>
        prev.map((v) => {
          if (v.id !== slotId) return v;

          if (v.preview) {
            URL.revokeObjectURL(v.preview);
          }

          return {
            ...v,
            file,
            preview: URL.createObjectURL(file),
            fileName: file.name || "",
            fileSize: file.size || 0,
            duration,
            status: "ready",
          };
        }),
      );
    } catch (error) {
      await alertError(
        "Error al procesar",
        error.message || "No se pudo procesar el video.",
      );
    } finally {
      setProcessingId("");
    }
  };

  const handleRemoveVideo = async (slotId) => {
    const video = videos.find((item) => item.id === slotId);

    if (!video?.preview) return;

    const ok = await alertConfirm({
      title: "Quitar video",
      text: `¿Deseas quitar el video "${video.title}"?`,
      confirmText: "Sí, quitar",
      cancelText: "Cancelar",
    });

    if (!ok) return;

    setVideos((prev) =>
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
          duration: 0,
          status: "empty",
        };
      }),
    );
  };

  /* =========================
     UNIR FOTOS Y VIDEOS POR GRUPO
  ========================= */

  const groupedFinal = useMemo(() => {
    const zonasConVideosAsignados = new Set();

    return gruposActivos.map((group) => {
      const zonaDelGrupo = group.zonas?.find((zona) =>
        zonasProtocoloFotos.includes(zona),
      );

      let videosDelGrupo = [];

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
     RENDER
  ========================= */

  return (
    <div className="photoTestPage">
      <div className="photoTestWrapper">
        <section className="photoCard">
          <div className="photoHeaderTop">
            <button
              type="button"
              className="btnBack"
              onClick={handleVolver}
              disabled={processingId !== ""}
            >
              ← Volver
            </button>
          </div>

          <h1 className="photoTitle">Fotos + Videos clínicos</h1>

          <p className="photoSubtitle">
            Protocolo activo para las zonas{" "}
            <strong>{zonasProtocoloFotos.map(getZonaTitle).join(", ")}</strong>.
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
              onVideoChange={handleVideoChange}
              onRemoveVideo={handleRemoveVideo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
