import PhotoSlotCard from "./PhotoSlotCard";
import VideoSlotCard from "./VideoSlotCard";

export default function PhotoGroupCard({
  group,
  photos = [],
  videos = [], // 🔵 nuevo: lista de videos del grupo
  processingId,
  onPhotoChange,
  onRemovePhoto,
  onVideoChange, // 🔵 nuevo
  onRemoveVideo, // 🔵 nuevo
}) {
  return (
    <section className="photoGroupCard">
      <div className="photoGroupHeader">
        <h2 className="photoGroupTitle">{group.title}</h2>
      </div>

      <div className="photoGroupGrid">
        {/* 🔵 FOTOS */}
        {photos.map((photo) => (
          <PhotoSlotCard
            key={photo.id}
            photo={photo}
            processingId={processingId}
            onPhotoChange={onPhotoChange}
            onRemovePhoto={onRemovePhoto}
          />
        ))}

        {/* 🔵 VIDEOS */}
        {videos.map((video) => (
          <VideoSlotCard
            key={video.id}
            video={video}
            processingId={processingId}
            onVideoChange={onVideoChange}
            onRemoveVideo={onRemoveVideo}
          />
        ))}
      </div>
    </section>
  );
}
