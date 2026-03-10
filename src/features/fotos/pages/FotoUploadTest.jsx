import { useEffect, useMemo, useState } from "react";
import "./FotoUploadTest.css";
import { compressImage, formatBytes } from "../utils/imageCompression";

export default function FotoUploadTest() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalPreview, setOriginalPreview] = useState("");
  const [compressedResult, setCompressedResult] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (originalPreview) {
        URL.revokeObjectURL(originalPreview);
      }

      if (compressedResult?.previewUrl) {
        URL.revokeObjectURL(compressedResult.previewUrl);
      }
    };
  }, [originalPreview, compressedResult]);

  const originalMeta = useMemo(() => {
    if (!selectedFile) return null;

    return {
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size,
    };
  }, [selectedFile]);

  const processSelectedFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      setSelectedFile(null);
      setOriginalPreview("");
      setCompressedResult(null);
      return;
    }

    if (originalPreview) {
      URL.revokeObjectURL(originalPreview);
    }

    if (compressedResult?.previewUrl) {
      URL.revokeObjectURL(compressedResult.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);

    setError("");
    setSelectedFile(file);
    setOriginalPreview(previewUrl);
    setCompressedResult(null);
  };

  const handleCameraChange = (e) => {
    const file = e.target.files?.[0];
    processSelectedFile(file);
  };

  const handleGalleryChange = (e) => {
    const file = e.target.files?.[0];
    processSelectedFile(file);
  };

  const handleCompress = async () => {
    if (!selectedFile) {
      setError("Primero toma una foto o elige una desde la galería.");
      return;
    }

    try {
      setCompressing(true);
      setError("");

      if (compressedResult?.previewUrl) {
        URL.revokeObjectURL(compressedResult.previewUrl);
      }

      const result = await compressImage(selectedFile, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.82,
        outputType: "image/jpeg",
      });

      setCompressedResult(result);
    } catch (err) {
      setError(err.message || "No se pudo comprimir la imagen.");
    } finally {
      setCompressing(false);
    }
  };

  const handleReset = () => {
    if (originalPreview) {
      URL.revokeObjectURL(originalPreview);
    }

    if (compressedResult?.previewUrl) {
      URL.revokeObjectURL(compressedResult.previewUrl);
    }

    setSelectedFile(null);
    setOriginalPreview("");
    setCompressedResult(null);
    setError("");
  };

  return (
    <div className="photoTestPage">
      <div className="photoTestWrapper">
        <section className="photoCard">
          <h1 className="photoTitle">Prueba de captura de fotos</h1>
          <p className="photoSubtitle">
            Primera prueba local: tomar foto o elegir una imagen,
            previsualizarla y comprimirla antes de subirla.
          </p>
        </section>

        <section className="photoCard">
          <div className="photoForm">
            <div className="captureGrid">
              <div className="field">
                <label className="fieldLabel" htmlFor="foto-camara">
                  Tomar foto
                </label>
                <input
                  id="foto-camara"
                  className="fileInput"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraChange}
                />
                <p className="fieldHelp">
                  En celular intentará abrir la cámara trasera.
                </p>
              </div>

              <div className="field">
                <label className="fieldLabel" htmlFor="foto-galeria">
                  Elegir desde galería
                </label>
                <input
                  id="foto-galeria"
                  className="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryChange}
                />
                <p className="fieldHelp">
                  Úsalo si ya tienes la foto guardada.
                </p>
              </div>
            </div>

            <div className="actions">
              <button
                type="button"
                className="btnPrimary"
                onClick={handleCompress}
                disabled={!selectedFile || compressing}
              >
                {compressing ? "Comprimiendo..." : "Optimizar imagen"}
              </button>

              <button
                type="button"
                className="btnSecondary"
                onClick={handleReset}
              >
                Limpiar
              </button>
            </div>

            {error ? <p className="errorText">{error}</p> : null}
          </div>
        </section>

        <div className="previewGrid">
          <section className="photoCard">
            <div className="previewBox">
              <h3>Vista previa original</h3>

              {originalPreview ? (
                <>
                  <img
                    src={originalPreview}
                    alt="Vista previa original"
                    className="previewImage"
                  />

                  {originalMeta ? (
                    <ul className="metaList">
                      <li className="metaItem">
                        <strong>Nombre:</strong> {originalMeta.name}
                      </li>
                      <li className="metaItem">
                        <strong>Tipo:</strong>{" "}
                        {originalMeta.type || "No disponible"}
                      </li>
                      <li className="metaItem">
                        <strong>Tamaño:</strong>{" "}
                        {formatBytes(originalMeta.size)}
                      </li>
                    </ul>
                  ) : null}
                </>
              ) : (
                <p className="emptyState">
                  Aún no has tomado ni seleccionado una imagen.
                </p>
              )}
            </div>
          </section>

          <section className="photoCard">
            <div className="previewBox">
              <h3>Vista previa optimizada</h3>

              {compressedResult?.previewUrl ? (
                <>
                  <img
                    src={compressedResult.previewUrl}
                    alt="Vista previa comprimida"
                    className="previewImage"
                  />

                  <ul className="metaList">
                    <li className="metaItem">
                      <strong>Nombre:</strong>{" "}
                      {compressedResult.compressed.name}
                    </li>
                    <li className="metaItem">
                      <strong>Tipo:</strong> {compressedResult.compressed.type}
                    </li>
                    <li className="metaItem">
                      <strong>Tamaño:</strong>{" "}
                      {formatBytes(compressedResult.compressed.size)}
                    </li>
                    <li className="metaItem">
                      <strong>Resolución:</strong>{" "}
                      {compressedResult.compressed.width} x{" "}
                      {compressedResult.compressed.height}
                    </li>
                  </ul>
                </>
              ) : (
                <p className="emptyState">
                  Aquí aparecerá la imagen optimizada cuando presiones el botón.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
