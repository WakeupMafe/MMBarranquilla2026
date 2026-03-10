import { useEffect, useState } from "react";
import "./FotoUploadTest.css";
import { compressImage, formatBytes } from "../utils/imageCompression";
import PhotoCaptureButton from "../../../shared/components/PhotoCaptureButton";

export default function FotoUploadTest() {
  const [photos, setPhotos] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      photos.forEach((photo) => {
        if (photo.originalPreview) {
          URL.revokeObjectURL(photo.originalPreview);
        }
        if (photo.compressedPreview) {
          URL.revokeObjectURL(photo.compressedPreview);
        }
      });
    };
  }, [photos]);

  const processFiles = async (fileList) => {
    const files = Array.from(fileList || []);

    if (!files.length) return;

    const invalidFile = files.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) {
      setError("Todos los archivos deben ser imágenes.");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      const processedPhotos = await Promise.all(
        files.map(async (file, index) => {
          const originalPreview = URL.createObjectURL(file);

          const result = await compressImage(file, {
            maxWidth: 1600,
            maxHeight: 1600,
            quality: 0.82,
            outputType: "image/jpeg",
          });

          return {
            id: `${file.name}-${Date.now()}-${index}`,
            originalFile: file,
            originalPreview,
            originalName: file.name,
            originalType: file.type,
            originalSize: file.size,
            compressedFile: result.file,
            compressedPreview: result.previewUrl,
            compressedName: result.compressed.name,
            compressedType: result.compressed.type,
            compressedSize: result.compressed.size,
            width: result.compressed.width,
            height: result.compressed.height,
          };
        }),
      );

      setPhotos((prev) => [...prev, ...processedPhotos]);
    } catch (err) {
      setError(err.message || "No se pudieron procesar las imágenes.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCameraChange = async (e) => {
    await processFiles(e.target.files);
    e.target.value = "";
  };

  const handleGalleryChange = async (e) => {
    await processFiles(e.target.files);
    e.target.value = "";
  };

  const handleRemovePhoto = (photoId) => {
    setPhotos((prev) => {
      const photoToDelete = prev.find((photo) => photo.id === photoId);

      if (photoToDelete?.originalPreview) {
        URL.revokeObjectURL(photoToDelete.originalPreview);
      }

      if (photoToDelete?.compressedPreview) {
        URL.revokeObjectURL(photoToDelete.compressedPreview);
      }

      return prev.filter((photo) => photo.id !== photoId);
    });
  };

  const handleReset = () => {
    photos.forEach((photo) => {
      if (photo.originalPreview) {
        URL.revokeObjectURL(photo.originalPreview);
      }
      if (photo.compressedPreview) {
        URL.revokeObjectURL(photo.compressedPreview);
      }
    });

    setPhotos([]);
    setError("");
  };

  return (
    <div className="photoTestPage">
      <div className="photoTestWrapper">
        <section className="photoCard">
          <h1 className="photoTitle">Prueba de captura de fotos</h1>
          <p className="photoSubtitle">
            Toma varias fotos o selecciónalas desde galería. Se optimizan
            automáticamente para dejarlas listas para subir.
          </p>
        </section>

        <section className="photoCard">
          <div className="photoForm">
            <div className="actions">
              <PhotoCaptureButton
                label={processing ? "Procesando..." : "📷 Tomar fotos"}
                inputId="foto-camara"
                capture="environment"
                multiple
                onChange={handleCameraChange}
              />

              <PhotoCaptureButton
                label={processing ? "Procesando..." : "🖼️ Elegir de galería"}
                inputId="foto-galeria"
                multiple
                secondary
                onChange={handleGalleryChange}
              />

              <button
                type="button"
                className="btnSecondary"
                onClick={handleReset}
                disabled={processing || photos.length === 0}
              >
                Limpiar todo
              </button>
            </div>

            <p className="fieldHelp">
              Las imágenes se reducen automáticamente a una resolución adecuada
              para subirlas sin que el usuario tenga que optimizarlas
              manualmente.
            </p>

            {error ? <p className="errorText">{error}</p> : null}
          </div>
        </section>

        {photos.length === 0 ? (
          <section className="photoCard">
            <p className="emptyState">
              Aún no has tomado ni seleccionado fotos.
            </p>
          </section>
        ) : (
          <div className="photoList">
            {photos.map((photo, index) => (
              <section className="photoCard" key={photo.id}>
                <div className="photoItemHeader">
                  <h3 className="photoItemTitle">Foto {index + 1}</h3>
                  <button
                    type="button"
                    className="removeBtn"
                    onClick={() => handleRemovePhoto(photo.id)}
                  >
                    Quitar
                  </button>
                </div>

                <div className="previewGrid">
                  <div className="previewBox">
                    <h3>Original</h3>
                    <img
                      src={photo.originalPreview}
                      alt={`Original ${index + 1}`}
                      className="previewImage"
                    />
                    <ul className="metaList">
                      <li className="metaItem">
                        <strong>Nombre:</strong> {photo.originalName}
                      </li>
                      <li className="metaItem">
                        <strong>Tipo:</strong> {photo.originalType}
                      </li>
                      <li className="metaItem">
                        <strong>Tamaño:</strong>{" "}
                        {formatBytes(photo.originalSize)}
                      </li>
                    </ul>
                  </div>

                  <div className="previewBox">
                    <h3>Optimizada</h3>
                    <img
                      src={photo.compressedPreview}
                      alt={`Optimizada ${index + 1}`}
                      className="previewImage"
                    />
                    <ul className="metaList">
                      <li className="metaItem">
                        <strong>Nombre:</strong> {photo.compressedName}
                      </li>
                      <li className="metaItem">
                        <strong>Tipo:</strong> {photo.compressedType}
                      </li>
                      <li className="metaItem">
                        <strong>Tamaño:</strong>{" "}
                        {formatBytes(photo.compressedSize)}
                      </li>
                      <li className="metaItem">
                        <strong>Resolución:</strong> {photo.width} x{" "}
                        {photo.height}
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
