import { useEffect, useState } from "react";
import "./FotoUploadTest.css";
import { compressImage } from "../utils/imageCompression";
import PhotoCaptureButton from "../../../shared/components/PhotoCaptureButton";

const PHOTO_SLOTS = [
  { id: "frente", title: "Foto de frente" },
  { id: "espalda", title: "Foto de espalda" },
  { id: "lado_derecho", title: "Foto de lado derecho" },
  { id: "lado_izquierdo", title: "Foto de lado izquierdo" },
  { id: "funcional", title: "Foto funcional / adicional" },
];

export default function FotoUploadTest() {
  const [photos, setPhotos] = useState(
    PHOTO_SLOTS.map((slot) => ({
      ...slot,
      file: null,
      preview: "",
      fileName: "",
      fileSize: 0,
      width: 0,
      height: 0,
      status: "empty",
    })),
  );

  const [processingId, setProcessingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      photos.forEach((photo) => {
        if (photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });
    };
  }, [photos]);

  const handlePhotoChange = async (slotId, fileList) => {
    const file = fileList?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }

    try {
      setProcessingId(slotId);
      setError("");

      const result = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.72,
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
      setError(err.message || "No se pudo procesar la imagen.");
    } finally {
      setProcessingId("");
    }
  };

  const handleRemovePhoto = (slotId) => {
    setPhotos((prev) =>
      prev.map((photo) => {
        if (photo.id !== slotId) return photo;

        if (photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }

        return {
          ...photo,
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

  const handleReset = () => {
    photos.forEach((photo) => {
      if (photo.preview) {
        URL.revokeObjectURL(photo.preview);
      }
    });

    setPhotos(
      PHOTO_SLOTS.map((slot) => ({
        ...slot,
        file: null,
        preview: "",
        fileName: "",
        fileSize: 0,
        width: 0,
        height: 0,
        status: "empty",
      })),
    );

    setError("");
    setProcessingId("");
  };

  const completedCount = photos.filter(
    (photo) => photo.status === "ready",
  ).length;

  return (
    <div className="photoTestPage">
      <div className="photoTestWrapper">
        <section className="photoCard">
          <h1 className="photoTitle">Simulacro de captura de fotos</h1>
          <p className="photoSubtitle">
            Toma las fotos guiadas del paciente. Cada imagen se comprime
            automáticamente y se visualiza de inmediato en su recuadro.
          </p>
        </section>

        <section className="photoCard">
          <div className="photoForm">
            <div className="actions">
              <button
                type="button"
                className="btnSecondary"
                onClick={handleReset}
                disabled={processingId !== ""}
              >
                Limpiar todo
              </button>
            </div>

            <p className="fieldHelp">
              Fotos completadas: <strong>{completedCount}</strong> de{" "}
              <strong>{photos.length}</strong>
            </p>

            {error ? <p className="errorText">{error}</p> : null}
          </div>
        </section>

        <div className="photoSlotsGrid">
          {photos.map((photo) => (
            <section className="photoSlotCard" key={photo.id}>
              <div className="photoSlotHeader">
                <h3 className="photoSlotTitle">{photo.title}</h3>
              </div>

              <div className="photoSlotPreview">
                {photo.preview ? (
                  <img
                    src={photo.preview}
                    alt={photo.title}
                    className="slotPreviewImage"
                  />
                ) : (
                  <div className="slotEmptyState">
                    <span className="slotEmptyIcon">📷</span>
                    <p className="slotEmptyText">{photo.title}</p>
                  </div>
                )}
              </div>

              <div className="photoSlotActions">
                <PhotoCaptureButton
                  label={
                    processingId === photo.id ? "Procesando..." : "Tomar foto"
                  }
                  inputId={`camera-${photo.id}`}
                  capture="environment"
                  onChange={(e) => {
                    handlePhotoChange(photo.id, e.target.files);
                    e.target.value = "";
                  }}
                />

                <PhotoCaptureButton
                  label="Galería"
                  inputId={`gallery-${photo.id}`}
                  secondary
                  onChange={(e) => {
                    handlePhotoChange(photo.id, e.target.files);
                    e.target.value = "";
                  }}
                />

                <button
                  type="button"
                  className="removeBtn"
                  onClick={() => handleRemovePhoto(photo.id)}
                  disabled={processingId === photo.id || !photo.preview}
                >
                  Quitar
                </button>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
