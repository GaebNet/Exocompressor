import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import VideoPlayer from './VideoPlayer';
import LoadingSpinner from './LoadingSpinner';
import ProgressBar from './ProgressBar';

const VideoCompressor = () => {
  const [video, setVideo] = useState<File | null>(null);
  const [compressedVideo, setCompressedVideo] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [removeAudio, setRemoveAudio] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('video/')) {
      setVideo(file);
      setCompressedVideo(null);
      setCompressionProgress(0);
      setOriginalSize(file.size);
      setCompressedSize(null);
      toast.success('Video selected successfully');
    } else {
      toast.error('Please select a valid video file');
    }
  };

  const handleCompression = async () => {
    if (!video) return;
    setIsCompressing(true);
    setCompressionProgress(0);
    try {
      // Simulate compression progress
      const duration = 3000; // 3 seconds
      const interval = 100;
      const steps = duration / interval;
      let currentStep = 0;

      const progressInterval = setInterval(() => {
        currentStep++;
        const progress = Math.min(95, (currentStep / steps) * 100);
        setCompressionProgress(progress);
        if (currentStep >= steps) {
          clearInterval(progressInterval);
        }
      }, interval);

      // Simulate video compression (replace with actual compression logic)
      await new Promise(resolve => setTimeout(resolve, duration));

      // Simulate compressed size (e.g., 40% smaller, or 55% if audio removed)
      let simulatedCompressedSize = video.size * (removeAudio ? 0.45 : 0.6);
      setCompressedSize(simulatedCompressedSize);

      const url = URL.createObjectURL(video);
      setCompressedVideo(url);
      setCompressionProgress(100);
      toast.success(`Video compressed${removeAudio ? ' (audio removed)' : ''} successfully!`);
    } catch (error) {
      toast.error('Error compressing video');
      console.error(error);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="video-upload"
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center w-full h-64 border-2 ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-gray-800 animate-bounce-small scale-102' 
              : 'border-gray-300'
          } border-dashed rounded-lg cursor-pointer transition-all duration-300 transform
          bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100
          hover:border-blue-400 hover:shadow-lg animate-scale-up`}
        >
          {isCompressing ? (
            <div className="flex flex-col items-center space-y-4 animate-fade-in">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                Processing video...
              </p>
              <div className="w-2/3 max-w-md animate-slide-up">
                <ProgressBar progress={compressionProgress} label="Compression progress" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6 transition-all duration-300 transform hover:scale-105">
              <svg
                className={`w-10 h-10 mb-3 ${
                  isDragActive 
                    ? 'text-blue-500 animate-bounce-small' 
                    : 'text-gray-400 hover:text-blue-500'
                } transition-all duration-300`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                <span className="font-semibold">{isDragActive ? 'Release to upload' : 'Click to upload'}</span>
                {!isDragActive && ' or drag and drop'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                MP4, MOV, or AVI (Max 500MB)
              </p>
            </div>
          )}
          <input
            id="video-upload"
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleVideoSelect}
            disabled={isCompressing}
          />
        </label>
      </div>

      {video && !isCompressing && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center mb-2">
            <input
              id="remove-audio"
              type="checkbox"
              checked={removeAudio}
              onChange={e => setRemoveAudio(e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 mr-2"
            />
            <label htmlFor="remove-audio" className="text-sm text-gray-700 dark:text-gray-200 select-none cursor-pointer">
              Remove audio for more size reduction
            </label>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 
            bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg 
            transition-all duration-300 transform hover:scale-102">
            <div className="flex items-center gap-3">
              <svg
                className="w-8 h-8 text-blue-500 dark:text-blue-400 transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{video.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Original size: {originalSize !== null ? (originalSize >= 1024 * 1024 ? `${(originalSize / (1024 * 1024)).toFixed(2)} MB` : `${(originalSize / 1024).toFixed(2)} KB`) : '-'}
                </p>
                {compressedSize && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Compressed size: {compressedSize >= 1024 * 1024 ? `${(compressedSize / (1024 * 1024)).toFixed(2)} MB` : `${(compressedSize / 1024).toFixed(2)} KB`}<br />
                    Reduced by: {originalSize && compressedSize ? (originalSize - compressedSize >= 1024 * 1024 ? `${((originalSize - compressedSize) / (1024 * 1024)).toFixed(2)} MB` : `${((originalSize - compressedSize) / 1024).toFixed(2)} KB`) : '-'}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleCompression}
              disabled={isCompressing}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white 
                bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700
                rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                disabled:opacity-50 transition-all duration-300 transform hover:scale-105 active:scale-95
                shadow-lg hover:shadow-xl"
            >
              Compress Video
            </button>
          </div>

          {compressedVideo && (
            <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl 
              transition-all duration-300 transform hover:scale-102 animate-scale-up">
              <VideoPlayer src={compressedVideo} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoCompressor;
