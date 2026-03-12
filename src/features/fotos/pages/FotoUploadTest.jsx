import { useEffect, useMemo, useState } from "react";
import "./FotoUploadTest.css";
import { compressImage } from "../utils/imageCompression";
import { alertConfirm, alertError, alertOk } from "../../../shared/lib/alerts";
import { PHOTO_GROUPS } from "../constants/photoGroups";
import PhotoGroupCard from "../components/PhotoGroupCard";
import { uploadFotoPaciente } from "../services/fotosService";

export default function FotoUploadTest() {
  const createEmptyPhotos = () =>
    PHOTO_GROUPS.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        groupId: group.id,
        groupTitle: group.title,
        file: null,
        preview: "",
        fileName: "",
        fileSize: 0,
        width: 0,
        height: 0,
        status: "empty",
      })),
    );

  const [photos, setPhotos] = useState(createEmptyPhotos());
  const [processingId, setProcessingId] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      photos.forEach((photo) => {
        if (photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });
    };
  }, [photos]);

  const groupedPhotos = useMemo(() => {
    return PHOTO_GROUPS.map((group) => ({
      ...group,
      photos: photos.filter((photo) => photo.groupId === group.id),
    }));
  }, [photos]);

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
        prev.map((photo) => {
          if (photo.id !== slotId) return photo;

          if (photo.preview) {
            URL.revokeObjectURL(photo.preview);
          }

          return {
            ...photo,
            file: result.file,
            preview: result.previewUrl,
            fileName: result.compressed.name,
            fileSize: result.compressed.size,
            width: result.compressed.width,
            height: result.compressed.height,
            status: "ready",
          };
        }),
      );
    } catch (err) {
      await alertError(
        "Error al procesar",
        err.message || "No se pudo procesar la imagen.",
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

  const handleReset = async () => {
    const hasPhotos = photos.some((photo) => photo.preview);

    if (!hasPhotos) {
      await alertError(
        "Nada para limpiar",
        "Aún no has cargado fotos en el protocolo.",
      );
      return;
    }

    const ok = await alertConfirm({
      title: "Limpiar protocolo",
      text: "¿Deseas eliminar todas las fotos cargadas?",
      confirmText: "Sí, limpiar",
      cancelText: "Cancelar",
    });

    if (!ok) return;

    photos.forEach((photo) => {
      if (photo.preview) {
        URL.revokeObjectURL(photo.preview);
      }
    });

    setPhotos(createEmptyPhotos());
    setProcessingId("");

    await alertOk(
      "Formulario limpiado",
      "Se reiniciaron todas las fotos del protocolo.",
    );
  };

  const handleUpload = async () => {
    const readyPhotos = photos.filter((photo) => photo.status === "ready");

    if (readyPhotos.length === 0) {
      await alertError(
        "No hay fotos",
        "Debes tomar al menos una foto antes de subir.",
      );
      return;
    }

    try {
      setUploading(true);

      const pacienteDocumento = "test123";
      const profesionalCedula = "1037670182";
      const sesionTipo = "evaluacion_inicial";

      for (const photo of readyPhotos) {
        await uploadFotoPaciente({
          file: photo.file,
          pacienteDocumento,
          tipoFoto: photo.id,
          sesionTipo,
          profesionalCedula,
        });
      }

      await alertOk(
        "Fotos subidas",
        `${readyPhotos.length} fotos se guardaron correctamente.`,
      );

      photos.forEach((photo) => {
        if (photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });

      setPhotos(createEmptyPhotos());
    } catch (error) {
      await alertError(
        "Error subiendo fotos",
        error.message || "No se pudieron subir las fotos.",
      );
    } finally {
      setUploading(false);
    }
  };

  const completedCount = photos.filter(
    (photo) => photo.status === "ready",
  ).length;

  return (
    <div className="photoTestPage">
      <div className="photoTestWrapper">
        <section className="photoCard">
          <h1 className="photoTitle">Protocolo de captura fotográfica</h1>
          <p className="photoSubtitle">
            Registra las tomas del protocolo clínico. Cada imagen se comprime
            automáticamente y se visualiza de inmediato en su recuadro.
          </p>
        </section>

        <section className="photoCard">
          <div className="photoForm">
            <p className="fieldHelp">
              Fotos completadas: <strong>{completedCount}</strong> de{" "}
              <strong>{photos.length}</strong>
            </p>

            <div className="actions">
              <button
                type="button"
                className="btnSecondary"
                onClick={handleReset}
                disabled={processingId !== "" || uploading}
              >
                Limpiar todo
              </button>

              <button
                type="button"
                className="btnPrimary"
                onClick={handleUpload}
                disabled={uploading || processingId !== ""}
              >
                {uploading ? "Subiendo..." : "Subir fotos"}
              </button>
            </div>
          </div>
        </section>

        <div className="photoGroupsList">
          {groupedPhotos.map((group) => (
            <PhotoGroupCard
              key={group.id}
              group={group}
              photos={group.photos}
              processingId={processingId}
              onPhotoChange={handlePhotoChange}
              onRemovePhoto={handleRemovePhoto}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
