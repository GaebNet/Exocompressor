import { useState, useRef } from 'react';
import { Upload, Video as VideoIcon, AlertCircle, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import VideoPlayer from './VideoPlayer';
import LoadingSpinner from './LoadingSpinner';
import ProgressBar from './ProgressBar';

const allQualityOptions = [
  { label: '144p', value: '144', height: 144 },
  { label: '240p', value: '240', height: 240 },
  { label: '360p', value: '360', height: 360 },
  { label: '480p', value: '480', height: 480 },
  { label: '720p (HD)', value: '720', height: 720 },
  { label: '1080p (Full HD)', value: '1080', height: 1080 },
  { label: '2K', value: '1440', height: 1440 },
  { label: '4K', value: '2160', height: 2160 },
  { label: 'Max/Original', value: 'max', height: Infinity },
];

const VideoCompressor = () => {
  const [video, setVideo] = useState<File | null>(null);
  const [videoHeight, setVideoHeight] = useState<number | null>(null);
  const [compressedVideo, setCompressedVideo] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [removeAudio, setRemoveAudio] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState('max');
  const [compressionMode, setCompressionMode] = useState<'quality' | 'size'>('quality');
  const [targetSize, setTargetSize] = useState<number>(10); // Target size in MB
  const [targetSizeUnit, setTargetSizeUnit] = useState<'MB' | 'KB'>('MB');
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
      // Detect video height
      const url = URL.createObjectURL(file);
      const videoElem = document.createElement('video');
      videoElem.preload = 'metadata';
      videoElem.src = url;
      videoElem.onloadedmetadata = () => {
        setVideoHeight(videoElem.videoHeight);
        URL.revokeObjectURL(url);
      };
      toast.success('Video selected successfully');
    } else {
      toast.error('Please select a valid video file');
    }
  };

  const handleCompression = async () => {
    if (!video) return;
    
    // Check browser support
    if (!window.MediaRecorder) {
      toast.error('Video compression not supported in this browser');
      return;
    }

    // Validate target size for size-based compression
    if (compressionMode === 'size') {
      const targetSizeBytes = targetSizeUnit === 'MB' ? targetSize * 1024 * 1024 : targetSize * 1024;
      if (targetSizeBytes >= video.size) {
        toast.error('Target size must be smaller than the original file size');
        return;
      }
      if (targetSizeBytes < 50000) { // 50KB minimum
        toast.error('Target size is too small. Minimum size is 50KB');
        return;
      }
    }
    
    setIsCompressing(true);
    setCompressionProgress(0);
    
    try {
      // Real video compression using MediaRecorder API
      setCompressionProgress(10);
      
      // Create video element
      const videoElement = document.createElement('video');
      videoElement.muted = true;
      videoElement.playsInline = true;
      
      // Load video
      await new Promise((resolve, reject) => {
        videoElement.onloadedmetadata = resolve;
        videoElement.onerror = reject;
        videoElement.src = URL.createObjectURL(video);
      });

      setCompressionProgress(20);

      // Set up canvas for video processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas not supported');
      }

      // Calculate target dimensions based on compression mode
      const originalWidth = videoElement.videoWidth;
      const originalHeight = videoElement.videoHeight;
      let scale: number;

      if (compressionMode === 'size') {
        // For size-based compression, estimate appropriate resolution
        const targetSizeBytes = targetSizeUnit === 'MB' ? targetSize * 1024 * 1024 : targetSize * 1024;
        const videoDuration = videoElement.duration;
        
        // Estimate scale based on target size (rough calculation)
        const originalPixels = originalWidth * originalHeight;
        const targetBitrate = (targetSizeBytes * 8) / videoDuration;
        const estimatedScale = Math.sqrt(Math.min(1.0, targetBitrate / (originalPixels * 0.1)));
        
        scale = Math.max(0.2, Math.min(1.0, estimatedScale)); // Between 20% and 100%
      } else {
        // Quality-based scaling (original logic)
        const qualityScales: { [key: string]: number } = {
          '144': 144 / originalHeight,
          '240': 240 / originalHeight,
          '360': 360 / originalHeight,
          '480': 480 / originalHeight,
          '720': 720 / originalHeight,
          '1080': 1080 / originalHeight,
          '1440': 1440 / originalHeight,
          '2160': 2160 / originalHeight,
          'max': 1.0
        };

        scale = Math.min(1.0, qualityScales[selectedQuality] || 1.0);
      }

      canvas.width = Math.floor(originalWidth * scale);
      canvas.height = Math.floor(originalHeight * scale);

      setCompressionProgress(30);

      // Set compression bitrate based on mode (quality or size)
      const pixelCount = canvas.width * canvas.height;
      let bitrate: number;

      if (compressionMode === 'size') {
        // Calculate bitrate based on target size
        const targetSizeBytes = targetSizeUnit === 'MB' ? targetSize * 1024 * 1024 : targetSize * 1024;
        const videoDuration = videoElement.duration;
        
        // Reserve space for audio if not removing it (approximately 10-20% of target size)
        const videoSizeRatio = removeAudio ? 0.95 : 0.8;
        const targetVideoBitrate = Math.floor((targetSizeBytes * videoSizeRatio * 8) / videoDuration);
        
        bitrate = Math.max(50000, Math.min(targetVideoBitrate, pixelCount * 0.15)); // Cap at reasonable max
      } else {
        // Quality-based compression (original logic)
        const qualityBitrates: { [key: string]: number } = {
          '144': Math.floor(pixelCount * 0.02),  // Very low bitrate
          '240': Math.floor(pixelCount * 0.03),  // Low bitrate
          '360': Math.floor(pixelCount * 0.04),  // Medium-low bitrate
          '480': Math.floor(pixelCount * 0.05),  // Medium bitrate
          '720': Math.floor(pixelCount * 0.06),  // Medium-high bitrate
          '1080': Math.floor(pixelCount * 0.07), // High bitrate
          '1440': Math.floor(pixelCount * 0.08), // Very high bitrate
          '2160': Math.floor(pixelCount * 0.09), // Ultra high bitrate
          'max': Math.floor(pixelCount * 0.1)    // Maximum bitrate
        };

        bitrate = Math.max(50000, qualityBitrates[selectedQuality] || Math.floor(pixelCount * 0.06));
      }

      // Create media stream from canvas
      const stream = canvas.captureStream(25); // 25 fps for better compression
      
      // Add audio if not removing it
      if (!removeAudio) {
        try {
          type WindowWithAudioContext = Window & {
            webkitAudioContext?: typeof AudioContext
          };
          const audioContext = new (window.AudioContext || (window as WindowWithAudioContext).webkitAudioContext)();
          const source = audioContext.createMediaElementSource(videoElement);
          const dest = audioContext.createMediaStreamDestination();
          source.connect(dest);
          
          dest.stream.getAudioTracks().forEach(track => {
            stream.addTrack(track);
          });
        } catch (err) {
          console.warn('Could not process audio:', err);
        }
      }

      // Set up MediaRecorder with optimized settings
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : 'video/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: bitrate
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      setCompressionProgress(40);

      // Start recording and play video
      mediaRecorder.start();
      videoElement.play();

      const duration = videoElement.duration;
      let lastTime = 0;

      // Update progress and draw frames
      const updateProgress = () => {
        if (!videoElement.paused && !videoElement.ended) {
          const currentTime = videoElement.currentTime;
          
          // Only redraw if time has changed significantly
          if (currentTime - lastTime > 0.04) { // ~25fps
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            lastTime = currentTime;
          }
          
          const progress = 40 + (currentTime / duration) * 50;
          setCompressionProgress(Math.min(90, progress));
          
          requestAnimationFrame(updateProgress);
        }
      };

      updateProgress();

      // Wait for video to finish with timeout
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          mediaRecorder.stop();
          reject(new Error('Compression timed out'));
        }, Math.max(30000, duration * 1000 + 10000)); // At least 30s, or video duration + 10s

        videoElement.onended = () => {
          clearTimeout(timeout);
          mediaRecorder.stop();
          resolve();
        };

        videoElement.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Video playback failed'));
        };
      });

      setCompressionProgress(95);

      // Get compressed video blob
      const compressedBlob = await new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          resolve(blob);
        };
      });

      // Create URL for the compressed video
      const compressedUrl = URL.createObjectURL(compressedBlob);
      setCompressedVideo(compressedUrl);
      setCompressedSize(compressedBlob.size);

      // Cleanup
      URL.revokeObjectURL(videoElement.src);
      setCompressionProgress(100);
      
      // Show compression statistics
      const compressionRatio = ((video.size - compressedBlob.size) / video.size * 100).toFixed(1);
      const actualSizeMB = (compressedBlob.size / (1024 * 1024)).toFixed(2);
      
      let successMessage: string;
      if (compressionMode === 'size') {
        const targetSizeMB = targetSizeUnit === 'MB' ? targetSize : targetSize / 1024;
        successMessage = `Video compressed to ${actualSizeMB} MB (target: ${targetSizeMB.toFixed(2)} MB)${removeAudio ? ' - audio removed' : ''}`;
      } else {
        successMessage = `Video compressed successfully! Size reduced by ${compressionRatio}%${removeAudio ? ' (audio removed)' : ''}`;
      }
      
      toast.success(successMessage);
    } catch (error) {
      console.error('Video compression error:', error);
      
      let errorMessage = 'Failed to compress video';
      if (error instanceof Error) {
        if (error.message.includes('Canvas not supported')) {
          errorMessage = 'Video compression not supported in this browser';
        } else if (error.message.includes('MediaRecorder')) {
          errorMessage = 'Video recording not supported in this browser';
        } else if (error.message.includes('codec')) {
          errorMessage = 'Video format not supported for compression';
        }
      }
      
      toast.error(errorMessage);
      setCompressionProgress(0);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto p-4 md:p-8 bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
      {/* Removed top features/information bar as requested */}
  {/* Upload Area - now at the top */}
  <div className="flex items-center justify-center w-full mb-8">
        <label
          htmlFor="video-upload"
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center w-full h-80 sm:h-[28rem] border-2 ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-102 animate-bounce-small' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          } border-dashed rounded-2xl cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] bg-white dark:bg-gray-800 shadow-xl animate-scale-up`}
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
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className={`p-6 rounded-full transition-all duration-300 transform ${isDragActive ? 'bg-blue-100 dark:bg-blue-900/30 scale-110' : 'bg-gray-100 dark:bg-gray-700 hover:scale-105'}`}>
                  <Upload className={`w-12 h-12 transition-transform duration-300 ${isDragActive ? 'text-blue-600 scale-110' : 'text-gray-400 dark:text-gray-500'}`} />
                </div>
              </div>
              <div className="animate-slide-up">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                  {isDragActive ? 'Drop your videos here' : 'Upload Videos to Compress'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">
                  {isDragActive ? 'Release to upload files' : 'Drag & drop videos here, or click to select files'}
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-400 dark:text-gray-500">
                  <div className="flex items-center space-x-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
                    <VideoIcon className="w-4 h-4" />
                    <span>MP4, MOV, AVI</span>
                  </div>
                  <div className="flex items-center space-x-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
                    <AlertCircle className="w-4 h-4" />
                    <span>Max 500MB per file</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  disabled={isCompressing}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className={`w-5 h-5 mr-2 ${isCompressing ? 'animate-bounce-small' : ''}`} />
                  {isCompressing ? 'Uploading...' : 'Select Videos'}
                </button>
              </div>
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
        <div className="space-y-6 animate-slide-up">
          {/* Compression Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-xl shadow-inner">
              <div className="flex">
                <button
                  onClick={() => setCompressionMode('quality')}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    compressionMode === 'quality'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600'
                  }`}
                >
                  By Quality
                </button>
                <button
                  onClick={() => setCompressionMode('size')}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    compressionMode === 'size'
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600'
                  }`}
                >
                  By Size
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 mb-4">
            <div className="flex items-center bg-blue-100 dark:bg-blue-900/40 px-4 py-2 rounded-xl shadow border border-blue-300 dark:border-blue-700">
              <input
                id="remove-audio"
                type="checkbox"
                checked={removeAudio}
                onChange={e => setRemoveAudio(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600 focus:ring-blue-500 mr-3 accent-blue-600"
              />
              <label htmlFor="remove-audio" className="text-base font-semibold text-blue-800 dark:text-blue-200 select-none cursor-pointer">
                Remove Audio
              </label>
            </div>

            {/* Quality or Size Controls */}
            {compressionMode === 'quality' ? (
              <div className="flex items-center bg-teal-100 dark:bg-teal-900/40 px-4 py-2 rounded-xl shadow border border-teal-300 dark:border-teal-700">
                <label htmlFor="quality-select" className="text-base font-semibold text-teal-800 dark:text-teal-200 mr-3 select-none cursor-pointer">
                  Quality
                </label>
                <select
                  id="quality-select"
                  value={selectedQuality}
                  onChange={e => setSelectedQuality(e.target.value)}
                  className="form-select rounded-lg border-teal-400 focus:border-teal-600 focus:ring focus:ring-teal-200 focus:ring-opacity-50 text-base px-3 py-1.5 font-medium bg-white dark:bg-gray-900 text-teal-900 dark:text-teal-200"
                >
                  {(videoHeight
                    ? allQualityOptions.filter(opt => opt.height <= videoHeight || opt.value === 'max')
                    : allQualityOptions
                  ).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-purple-100 dark:bg-purple-900/40 px-4 py-2 rounded-xl shadow border border-purple-300 dark:border-purple-700">
                <label className="text-base font-semibold text-purple-800 dark:text-purple-200 select-none">
                  Target Size:
                </label>
                <input
                  type="number"
                  min="0.1"
                  max={targetSizeUnit === 'MB' ? 1000 : 1000000}
                  step={targetSizeUnit === 'MB' ? 0.1 : 10}
                  value={targetSize}
                  onChange={e => {
                    const value = Number(e.target.value);
                    const maxSize = targetSizeUnit === 'MB' ? 1000 : 1000000;
                    const minSize = targetSizeUnit === 'MB' ? 0.1 : 100;
                    setTargetSize(Math.max(minSize, Math.min(maxSize, value)));
                  }}
                  className="w-20 px-2 py-1 rounded border border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 text-purple-900 dark:text-purple-200 bg-white dark:bg-gray-900"
                  placeholder={targetSizeUnit === 'MB' ? '10.0' : '1000'}
                />
                <select
                  value={targetSizeUnit}
                  onChange={e => setTargetSizeUnit(e.target.value as 'MB' | 'KB')}
                  className="px-2 py-1 rounded border border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 text-purple-900 dark:text-purple-200 bg-white dark:bg-gray-900"
                >
                  <option value="MB">MB</option>
                  <option value="KB">KB</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 
            bg-gradient-to-br from-blue-50/80 via-white/80 to-teal-50/80 dark:from-gray-800/80 dark:via-gray-900/80 dark:to-gray-800/80
            rounded-2xl shadow-lg hover:shadow-2xl 
            transition-all duration-300 transform hover:scale-102 border border-gray-100 dark:border-gray-700">
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
                  <div className="text-sm text-green-600 dark:text-green-400">
                    <div>Compressed size: {compressedSize >= 1024 * 1024 ? `${(compressedSize / (1024 * 1024)).toFixed(2)} MB` : `${(compressedSize / 1024).toFixed(2)} KB`}</div>
                    <div>Reduced by: {originalSize && compressedSize ? (originalSize - compressedSize >= 1024 * 1024 ? `${((originalSize - compressedSize) / (1024 * 1024)).toFixed(2)} MB` : `${((originalSize - compressedSize) / 1024).toFixed(2)} KB`) : '-'}</div>
                    <div>
                      Reduction: {originalSize && compressedSize ? `${(((originalSize - compressedSize) / originalSize) * 100).toFixed(1)}%` : '-'}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleCompression}
              disabled={isCompressing}
              className="w-full sm:w-auto px-8 py-3 text-base font-semibold text-white 
                bg-gradient-to-r from-blue-600 via-teal-500 to-green-500 hover:from-blue-700 hover:to-teal-700
                rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                disabled:opacity-50 transition-all duration-300 transform hover:scale-105 active:scale-95
                shadow-xl hover:shadow-2xl border-2 border-transparent hover:border-blue-400"
            >
              Compress Video
            </button>
          </div>

          {compressedVideo && (
            <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl 
              transition-all duration-300 transform hover:scale-102 animate-scale-up flex flex-col items-center">
              {/* Simulate audio removal by muting the video if removeAudio is selected */}
              <VideoPlayer src={compressedVideo} muted={removeAudio} />
              {removeAudio && (
                <div className="mt-2 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300 font-semibold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9v6h4l5 5V4l-5 5H9z" /></svg>
                  Audio removed in preview
                </div>
              )}
              {/* Download Button */}
              <a
                href={compressedVideo}
                download={video ? `compressed_${video.name}` : 'compressed_video.mp4'}
                className="mt-4 inline-block px-6 py-2.5 text-base font-semibold text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-transparent hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Download Video
              </a>
            </div>
          )}
        </div>
      )}
      {/* Features Bar - now at the bottom */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-110">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Upload</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drop multiple videos or select from device
          </p>
        </div>
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in delay-100">
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-110">
            <VideoIcon className="w-6 h-6 text-teal-600" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Compress</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Optimize file size while maintaining quality
          </p>
        </div>
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in delay-200">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-110">
            <Download className="w-6 h-6 text-orange-600" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Download</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Save your optimized video
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCompressor;
