interface VideoPlayerProps {
  src: string;
}

const VideoPlayer = ({ src }: VideoPlayerProps) => {
  return (
    <div className="w-full aspect-video">
      <video 
        src={src} 
        controls
        className="w-full h-full object-contain bg-black"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
