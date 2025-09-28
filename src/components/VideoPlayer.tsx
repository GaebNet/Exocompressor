interface VideoPlayerProps {
  src: string;
  muted?: boolean;
}

const VideoPlayer = ({ src, muted = false }: VideoPlayerProps) => {
  return (
    <div className="w-full aspect-video">
      <video 
        src={src} 
        controls
        muted={muted}
        className="w-full h-full object-contain bg-black"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
