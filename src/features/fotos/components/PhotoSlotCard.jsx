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
        {photo.preview ? (
          <img
            src={photo.preview}
            alt={photo.title}
            className="slotPreviewImage"
          />
        ) : guideImage ? (
          <img
            src={guideImage}
            alt={`Guía ${photo.title}`}
            className="slotGuideImage"
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
            processingId === photo.id
              ? "Procesando..."
              : `Tomar ${photo.title.toLowerCase()}`
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
          label={`Elegir ${photo.title.toLowerCase()}`}
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
