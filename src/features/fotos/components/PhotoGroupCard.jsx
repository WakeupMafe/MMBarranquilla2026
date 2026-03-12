import PhotoSlotCard from "./PhotoSlotCard";

export default function PhotoGroupCard({
  group,
  photos,
  processingId,
  onPhotoChange,
  onRemovePhoto,
}) {
  return (
    <section className="photoGroupCard">
      <div className="photoGroupHeader">
        <h2 className="photoGroupTitle">{group.title}</h2>
      </div>

      <div className="photoGroupGrid">
        {photos.map((photo) => (
          <PhotoSlotCard
            key={photo.id}
            photo={photo}
            processingId={processingId}
            onPhotoChange={onPhotoChange}
            onRemovePhoto={onRemovePhoto}
          />
        ))}
      </div>
    </section>
  );
}
