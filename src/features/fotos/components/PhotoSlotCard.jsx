import PhotoCaptureButton from "../../../shared/components/PhotoCaptureButton";
import { PHOTO_GUIDES } from "../constants/photoGuides";

export default function PhotoSlotCard({
  photo,
  processingId,
  onPhotoChange,
  onRemovePhoto,
}) {
  const guideImage = PHOTO_GUIDES[photo.id];

  return (
    <section className="photoSlotCard">
      <div className="photoSlotHeader">
        <h3 className="photoSlotTitle">{photo.title}</h3>
      </div>

      <div className="photoSlotPreview">
        {/* ✅ Si ya hay foto */}
        {photo.preview ? (
          <img
            src={photo.preview}
            alt={photo.title}
            className="slotPreviewImage"
          />
        ) : (
          <>
            {/* ✅ Si existe guía */}
            {guideImage ? (
              <img
                src={guideImage}
                alt={`Guía ${photo.title}`}
                className="slotGuideImage"
              />
            ) : (
              /* ✅ Fallback clínico bonito */
              <div className="slotEmptyState slotEmptyState--pro">
                <span className="slotEmptyIcon">📷</span>
                <p className="slotEmptyText">{photo.title}</p>
                <span className="slotEmptyHint">Guía no disponible</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="photoSlotActions">
        <PhotoCaptureButton
          label={
            processingId === photo.id
              ? "Procesando..."
              : `Capturar ${photo.title.toLowerCase()}`
          }
          inputId={`camera-${photo.id}`}
          capture="environment"
          className={photo.preview ? "slotActionBtn--success" : ""}
          onChange={(e) => {
            onPhotoChange(photo.id, e.target.files);
            e.target.value = "";
          }}
        />

        <PhotoCaptureButton
          label={`Subir ${photo.title.toLowerCase()}`}
          inputId={`gallery-${photo.id}`}
          secondary
          className={
            photo.preview
              ? "slotActionBtn slotActionBtn--successSoft"
              : "slotActionBtn"
          }
          onChange={(e) => {
            onPhotoChange(photo.id, e.target.files);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          className="removeBtn"
          onClick={() => onRemovePhoto(photo.id)}
          disabled={processingId === photo.id || !photo.preview}
        >
          Quitar
        </button>
      </div>
    </section>
  );
}
