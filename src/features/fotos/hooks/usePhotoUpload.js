import { useState } from "react";
import { alertError, alertConfirm } from "../../../shared/lib/alerts";

/* =========================
   CONFIG VIDEO
========================= */

const MAX_VIDEO_DURATION_SECONDS = 14;
const MAX_VIDEO_SIZE_MB = 30;

/* =========================
   HELPERS VIDEO
========================= */

function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
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
}

function bytesToMb(bytes) {
  return Number(bytes || 0) / (1024 * 1024);
}

/* =========================
   HOOK PRINCIPAL
========================= */

export function usePhotoUpload() {
  const [processingId, setProcessingId] = useState("");

  /* =========================
     VIDEO
  ========================= */

  const handleVideoChange = async (slotId, fileList, setVideos) => {
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

      const sizeMb = bytesToMb(file.size);

      if (sizeMb > MAX_VIDEO_SIZE_MB) {
        await alertError(
          "Video demasiado pesado",
          `El video supera el máximo permitido de ${MAX_VIDEO_SIZE_MB} MB.`,
        );
        return;
      }

      const duration = await getVideoDuration(file);

      if (duration > MAX_VIDEO_DURATION_SECONDS) {
        await alertError(
          "Video demasiado largo",
          `El video debe durar máximo ${MAX_VIDEO_DURATION_SECONDS} segundos.`,
        );
        return;
      }

      setVideos((prev) =>
        prev.map((item) => {
          if (item.id !== slotId) return item;

          if (item.preview) {
            URL.revokeObjectURL(item.preview);
          }

          return {
            ...item,
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

  const handleRemoveVideo = async (slotId, videos, setVideos) => {
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

  return {
    processingId,
    setProcessingId,
    handleVideoChange,
    handleRemoveVideo,
  };
}
