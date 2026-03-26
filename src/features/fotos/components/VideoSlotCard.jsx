import BotonImportante from "../../../shared/components/BotonImportante/BotonImportante";

export default function VideoSlotCard({
  video,
  processingId,
  onVideoChange,
  onRemoveVideo,
}) {
  const isProcessing = processingId === video.id;

  return (
    <section className="photoSlotCard">
      <div className="photoSlotHeader">
        <h3 className="photoSlotTitle">{video.title}</h3>
      </div>

      <div className="photoSlotPreview">
        {video.preview ? (
          <video
            src={video.preview}
            controls
            playsInline
            className="slotPreviewImage"
          />
        ) : (
          <div className="slotEmptyState slotEmptyState--pro">
            <span className="slotEmptyIcon">🎥</span>
            <p className="slotEmptyText">{video.title}</p>
            <span className="slotEmptyHint">Video clínico pendiente</span>
          </div>
        )}
      </div>

      <div className="photoSlotActions">
        {/* INPUT OCULTOS */}
        <input
          id={`camera-video-${video.id}`}
          type="file"
          accept="video/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={(e) => {
            onVideoChange(video.id, e.target.files);
            e.target.value = "";
          }}
        />

        <input
          id={`gallery-video-${video.id}`}
          type="file"
          accept="video/*"
          style={{ display: "none" }}
          onChange={(e) => {
            onVideoChange(video.id, e.target.files);
            e.target.value = "";
          }}
        />

        {/* BOTONES BONITOS */}
        <BotonImportante
          onClick={() =>
            document.getElementById(`camera-video-${video.id}`).click()
          }
          disabled={isProcessing}
        >
          {isProcessing
            ? "Procesando..."
            : `Grabar ${video.title.toLowerCase()}`}
        </BotonImportante>

        <BotonImportante
          variant="outline"
          onClick={() =>
            document.getElementById(`gallery-video-${video.id}`).click()
          }
          disabled={isProcessing}
        >
          Subir {video.title.toLowerCase()}
        </BotonImportante>

        <BotonImportante
          variant="ghost"
          onClick={() => onRemoveVideo(video.id)}
          disabled={isProcessing || !video.preview}
        >
          Quitar
        </BotonImportante>
      </div>
    </section>
  );
}
