import { alertError, alertOk } from "../../../shared/lib/alerts";
import { uploadFotoPaciente } from "../services/fotosService";
import { uploadVideoPaciente } from "../services/videosService";
import {
  FOTO_UPLOAD_MODES,
  getFotosUploadMode,
} from "../../../shared/lib/fotosUploadMode";

/* =========================
   FUNCIÓN PRINCIPAL DE ENVÍO
   - Valida protocolo
   - Sube fotos
   - Sube videos
   - Limpia previews
   - Resetea estado
   - Maneja navegación final
========================= */

export async function hadleUploadPhoto({
  photos,
  videos,
  totalRequiredCount,
  todoCompleto,
  pacienteDocumento,
  profesionalCedula,
  zonasProtocoloFotos,
  createEmptyPhotos,
  createEmptyVideos,
  setPhotos,
  setVideos,
  setProcessingId,
  setUploading,
  navigate,
  locationState,
}) {
  const readyPhotos = photos.filter((item) => item.status === "ready");
  const readyVideos = videos.filter((item) => item.status === "ready");

  /* =========================
     VALIDACIONES
  ========================= */

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
      "No se encontró la cédula del paciente.",
    );
    return;
  }

  if (!profesionalCedula) {
    await alertError(
      "Profesional no identificado",
      "No se encontró la cédula del profesional.",
    );
    return;
  }

  try {
    setUploading(true);

    const sesionTipo = `evaluacion_${zonasProtocoloFotos.join("_")}`;
    const uploadMode = getFotosUploadMode();

    /* =========================
       SUBIR FOTOS
    ========================= */
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

    /* =========================
       SUBIR VIDEOS
    ========================= */
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

    /* =========================
       LIMPIAR PREVIEWS
    ========================= */
    photos.forEach((item) => {
      if (item.preview) URL.revokeObjectURL(item.preview);
    });

    videos.forEach((item) => {
      if (item.preview) URL.revokeObjectURL(item.preview);
    });

    /* =========================
       RESET ESTADO
    ========================= */
    setPhotos(createEmptyPhotos());
    setVideos(createEmptyVideos());
    setProcessingId("");

    /* =========================
       ALERTA FINAL
    ========================= */
    if (uploadMode === FOTO_UPLOAD_MODES.SIMULACION) {
      await alertOk(
        "Simulación completada",
        `Se simuló el envío de ${readyPhotos.length} foto(s) y ${readyVideos.length} video(s).`,
      );
    } else {
      await alertOk(
        "Evidencia guardada",
        `Se guardaron ${readyPhotos.length} foto(s) y ${readyVideos.length} video(s).`,
      );
    }

    /* =========================
       NAVEGACIÓN INTELIGENTE
    ========================= */

    const rutaPostEnvio = String(locationState?.rutaPostEnvio || "").trim();

    // 🔹 Caso 1: ruta explícita
    if (rutaPostEnvio) {
      navigate(rutaPostEnvio, { state: { ...locationState } });
      return;
    }

    // 🔹 Caso 2: flujo clínico
    if (String(pacienteDocumento || "").trim()) {
      navigate("/herramientas/anamnesis-zona", {
        state: { ...locationState },
      });
      return;
    }

    // 🔹 Caso 3: fallback
    navigate("/herramientas", { replace: true });
  } catch (error) {
    await alertError(
      "Error al enviar",
      error.message || "No se pudo completar el envío.",
    );
  } finally {
    setUploading(false);
  }
}
