import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import "./FotoUploadTest.css";
import { compressImage } from "../utils/imageCompression";
import { alertConfirm, alertError, alertOk } from "../../../shared/lib/alerts";
import { PHOTO_GROUPS } from "../constants/photoGroups";
import PhotoGroupCard from "../components/PhotoGroupCard";
import { uploadFotoPaciente } from "../services/fotosService";

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
        "funcional",
    );

    return [zonaUnica];
  }, [location.state]);

  const gruposActivos = useMemo(() => {
    if (!zonasProtocoloFotos.length) return [];

    if (zonasProtocoloFotos.includes("funcional")) {
      return PHOTO_GROUPS;
    }

    return PHOTO_GROUPS.filter((group) =>
      group.zonas?.some((zona) => zonasProtocoloFotos.includes(zona)),
    );
  }, [zonasProtocoloFotos]);

  const createEmptyPhotos = () =>
    gruposActivos.flatMap((group) =>
      group.items.map((item) => {
        const zonaDeItem =
          group.zonas?.find((zona) => zonasProtocoloFotos.includes(zona)) ||
          group.zonas?.[0] ||
          "funcional";

        return {
          ...item,
          zona: zonaDeItem,
          groupId: group.id,
          groupTitle: group.title,
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

  const [photos, setPhotos] = useState([]);
  const [processingId, setProcessingId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [faseCompletada, setFaseCompletada] = useState(false);

  useEffect(() => {
    setPhotos(createEmptyPhotos());
    setProcessingId("");
    setFaseCompletada(false);
  }, [gruposActivos]);

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
    return gruposActivos.map((group) => ({
      ...group,
      photos: photos.filter((photo) => photo.groupId === group.id),
    }));
  }, [gruposActivos, photos]);

  const completedCount = photos.filter(
    (photo) => photo.status === "ready",
  ).length;

  const todasCompletas =
    photos.length > 0 && photos.every((photo) => photo.status === "ready");

  useEffect(() => {
    if (faseCompletada) return;
    if (!todasCompletas) return;

    setFaseCompletada(true);

    alertOk(
      "Primera fase completada",
      "Excelente. Has completado la primera fase de valoración. Puedes continuar con la encuesta de logros. Por favor digita tu cédula para crear un seguimiento de los profesionales.",
    );
  }, [todasCompletas, faseCompletada]);

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

    setFaseCompletada(false);
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
    setFaseCompletada(false);

    await alertOk(
      "Formulario limpiado",
      "Se reiniciaron todas las fotos del protocolo.",
    );
  };

  const handleUpload = async () => {
    const readyPhotos = photos.filter((photo) => photo.status === "ready");

    if (photos.length === 0) {
      await alertError(
        "Sin protocolo activo",
        "No se encontró un protocolo fotográfico para esta valoración.",
      );
      return;
    }

    if (completedCount !== photos.length) {
      await alertError(
        "Protocolo incompleto",
        "Debes completar todas las fotografías del protocolo antes de continuar.",
      );
      return;
    }

    try {
      setUploading(true);

      const pacienteDocumento =
        location.state?.cedula ||
        location.state?.paciente?.numero_documento_fisico ||
        "test123";

      const profesionalCedula =
        location.state?.profesional?.cedula || "1037670182";

      const sesionTipo = `evaluacion_${zonasProtocoloFotos.join("_")}`;

      for (const photo of readyPhotos) {
        await uploadFotoPaciente({
          file: photo.file,
          pacienteDocumento,
          tipoFoto: photo.id,
          sesionTipo,
          profesionalCedula,
          zona: photo.zona,
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
      setFaseCompletada(false);
    } catch (error) {
      await alertError(
        "Error subiendo fotos",
        error.message || "No se pudieron subir las fotos.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="photoTestPage">
      <div className="photoTestWrapper">
        <section className="photoCard">
          <h1 className="photoTitle">Protocolo de captura fotográfica</h1>
          <p className="photoSubtitle">
            Protocolo activo para las zonas{" "}
            <strong>{zonasProtocoloFotos.map(getZonaTitle).join(", ")}</strong>.
            Registra únicamente las tomas requeridas para esta fase clínica.
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
                disabled={
                  uploading ||
                  processingId !== "" ||
                  completedCount !== photos.length ||
                  photos.length === 0
                }
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
