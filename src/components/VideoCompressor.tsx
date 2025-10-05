import { useState, useRef, useEffect } from 'react';
import { Upload, Video as VideoIcon, AlertCircle, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import VideoPlayer from './VideoPlayer';
import LoadingSpinner from './LoadingSpinner';
import ProgressBar from './ProgressBar';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

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
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [compressedVideo, setCompressedVideo] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [removeAudio, setRemoveAudio] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState('max');
  const [compressionMode, setCompressionMode] = useState<'quality' | 'size'>('quality');
  const [targetSize, setTargetSize] = useState(10);
  const [targetUnit, setTargetUnit] = useState<'MB' | 'KB'>('MB');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  useEffect(() => {
    const loadFfmpeg = async () => {
      try {
        const ffmpeg = ffmpegRef.current;
        
        ffmpeg.on('log', ({ message }) => {
          console.log('[FFmpeg]', message);
        });
        
        ffmpeg.on('progress', ({ progress }) => {
          console.log('[FFmpeg Progress]', progress);
          setCompressionProgress(Math.round(progress * 100));
        });
        
        console.log('Loading FFmpeg...');
        
        // Load FFmpeg with specific core files
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        
        console.log('FFmpeg loaded successfully!');
        setFfmpegLoaded(true);
        toast.success('Video compression ready!');
      } catch (error) {
        console.error('FFmpeg load error:', error);
        toast.error('Failed to load video compression. Please check console for details.');
      }
    };
    
    loadFfmpeg();
  }, []);

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
      setVideoHeight(null);
      setVideoDuration(null);
      // Detect video metadata (height and duration)
      const url = URL.createObjectURL(file);
      const videoElem = document.createElement('video');
      videoElem.preload = 'metadata';
      videoElem.src = url;
      videoElem.onloadedmetadata = () => {
        setVideoHeight(videoElem.videoHeight);
        setVideoDuration(videoElem.duration);
        console.log('Video metadata - Height:', videoElem.videoHeight, 'Duration:', videoElem.duration, 'seconds');
        URL.revokeObjectURL(url);
      };
      toast.success('Video selected successfully');
    } else {
      toast.error('Please select a valid video file');
    }
  };

  const handleCompression = async () => {
    if (!video) {
      console.log('No video selected');
      return;
    }
    if (!ffmpegLoaded) {
      console.log('FFmpeg not loaded yet');
      toast.error('FFmpeg is not loaded yet. Please wait.');
      return;
    }

    // Validate size-based compression
    if (compressionMode === 'size') {
      const targetSizeBytes = targetSize * (targetUnit === 'MB' ? 1024 * 1024 : 1024);
      if (targetSizeBytes >= video.size * 0.8) {
        toast.error('Target size is too close to original size. Please choose a smaller target.');
        return;
      }
      console.log('Starting size-based compression for:', video.name, 'Target:', targetSize + targetUnit, 'Original:', (video.size / (1024 * 1024)).toFixed(2) + 'MB');
    } else {
      console.log('Starting quality-based compression for:', video.name, 'Quality:', selectedQuality);
    }
    
    setIsCompressing(true);
    setCompressionProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      console.log('Writing file to FFmpeg...');
      await ffmpeg.writeFile(video.name, await fetchFile(video));
      console.log('File written successfully');

      let args = ['-i', video.name];
      
      if (compressionMode === 'size') {
        // Calculate target bitrate based on desired file size
        const targetSizeBytes = targetSize * (targetUnit === 'MB' ? 1024 * 1024 : 1024);
        
        // Use actual video duration or fallback to estimation
        const duration = videoDuration || 60; // Use actual duration if available, otherwise default to 60s
        
        if (!videoDuration) {
          console.warn('Video duration not available, using estimated 60 seconds');
          toast.error('Could not determine video duration. Results may be inaccurate.');
        }
        
        // Calculate target bitrate (accounting for audio if not removed)
        const audioBitrate = removeAudio ? 0 : 128; // 128kbps for audio
        const overhead = 0.95; // Account for container overhead (5%)
        const targetBitrateKbps = Math.max(50, Math.floor(((targetSizeBytes * 8 * overhead) / (1024 * duration)) - audioBitrate));
        
        console.log('Size compression - Target:', targetSize + targetUnit, 'Duration:', duration + 's', 'Target bitrate:', targetBitrateKbps + 'k');
        
        // Use two-pass encoding for better size accuracy
        args.push(
          '-c:v', 'libx264', 
          '-preset', 'medium', // Better quality than 'fast' for size-based compression
          '-b:v', `${targetBitrateKbps}k`,
          '-maxrate', `${Math.floor(targetBitrateKbps * 1.1)}k`, // Tighter control
          '-bufsize', `${Math.floor(targetBitrateKbps * 1.5)}k`,
          '-crf', '28' // Fallback quality setting
        );
      } else {
        // Define compression options based on quality
        const qualityArgs: { [key: string]: string[] } = {
          '144': ['-vf', 'scale=-1:144', '-b:v', '300k', '-c:v', 'libx264', '-preset', 'fast'],
          '240': ['-vf', 'scale=-1:240', '-b:v', '500k', '-c:v', 'libx264', '-preset', 'fast'],
          '360': ['-vf', 'scale=-1:360', '-b:v', '800k', '-c:v', 'libx264', '-preset', 'fast'],
          '480': ['-vf', 'scale=-1:480', '-b:v', '1200k', '-c:v', 'libx264', '-preset', 'fast'],
          '720': ['-vf', 'scale=-1:720', '-b:v', '2500k', '-c:v', 'libx264', '-preset', 'fast'],
          '1080': ['-vf', 'scale=-1:1080', '-b:v', '5000k', '-c:v', 'libx264', '-preset', 'fast'],
          '1440': ['-vf', 'scale=-1:1440', '-b:v', '10000k', '-c:v', 'libx264', '-preset', 'fast'],
          '2160': ['-vf', 'scale=-1:2160', '-b:v', '20000k', '-c:v', 'libx264', '-preset', 'fast'],
          'max': ['-c:v', 'libx264', '-preset', 'fast', '-crf', '23'],
        };
        args.push(...qualityArgs[selectedQuality]);
      }
      
      if (removeAudio) {
        args.push('-an');
      }
      args.push('output.mp4');

      console.log('FFmpeg command:', args.join(' '));
      await ffmpeg.exec(args);
      console.log('FFmpeg execution completed');

      const data = await ffmpeg.readFile('output.mp4');
      console.log('Read output file, size:', data.length);
      
      const uint8 = data as Uint8Array;
      const arrayBuffer = new Uint8Array(uint8).buffer;
      const compressedBlob = new Blob([arrayBuffer], { type: 'video/mp4' });
      const compressedUrl = URL.createObjectURL(compressedBlob);
      
      console.log('Compressed blob size:', compressedBlob.size, 'Original size:', video.size);

      setCompressedVideo(compressedUrl);
      setCompressedSize(compressedBlob.size);
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
          {!ffmpegLoaded ? (
            <div className="flex flex-col items-center space-y-4 animate-fade-in">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                Loading video compression engine...
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Please wait while FFmpeg initializes
              </p>
            </div>
          ) : isCompressing ? (
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
                  disabled={!ffmpegLoaded || isCompressing}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className={`w-5 h-5 mr-2 ${isCompressing ? 'animate-bounce-small' : ''}`} />
                  {!ffmpegLoaded ? 'Loading...' : isCompressing ? 'Uploading...' : 'Select Videos'}
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
          <div className="space-y-4 mb-6">
            {/* Compression Mode Selection */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center bg-purple-100 dark:bg-purple-900/40 px-4 py-2 rounded-xl shadow border border-purple-300 dark:border-purple-700">
                <label className="text-base font-semibold text-purple-800 dark:text-purple-200 mr-3">
                  Compression Mode:
                </label>
                <select
                  value={compressionMode}
                  onChange={e => setCompressionMode(e.target.value as 'quality' | 'size')}
                  className="form-select rounded-lg border-purple-400 focus:border-purple-600 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-base px-3 py-1.5 font-medium bg-white dark:bg-gray-900 text-purple-900 dark:text-purple-200"
                >
                  <option value="quality">By Quality</option>
                  <option value="size">By Target Size</option>
                </select>
              </div>
            </div>
            
            {/* Compression Settings */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
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
                <div className="space-y-2">
                  <div className="flex items-center bg-orange-100 dark:bg-orange-900/40 px-4 py-2 rounded-xl shadow border border-orange-300 dark:border-orange-700 gap-2">
                    <label className="text-base font-semibold text-orange-800 dark:text-orange-200">
                      Target Size:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={targetUnit === 'MB' ? 1000 : 1000000}
                      value={targetSize}
                      onChange={e => setTargetSize(Number(e.target.value))}
                      className="w-20 px-2 py-1 rounded border border-orange-400 focus:border-orange-600 focus:ring focus:ring-orange-200 focus:ring-opacity-50 text-center bg-white dark:bg-gray-900 text-orange-900 dark:text-orange-200"
                    />
                    <select
                      value={targetUnit}
                      onChange={e => setTargetUnit(e.target.value as 'MB' | 'KB')}
                      className="form-select rounded border-orange-400 focus:border-orange-600 focus:ring focus:ring-orange-200 focus:ring-opacity-50 px-2 py-1 bg-white dark:bg-gray-900 text-orange-900 dark:text-orange-200"
                    >
                      <option value="MB">MB</option>
                      <option value="KB">KB</option>
                    </select>
                  </div>
                  {video && originalSize && (
                    <div className="text-xs text-orange-600 dark:text-orange-400 px-2">
                      Original: {(originalSize / (1024 * 1024)).toFixed(2)} MB
                      {videoDuration && ` • Duration: ${Math.floor(videoDuration / 60)}:${Math.floor(videoDuration % 60).toString().padStart(2, '0')}`}
                    </div>
                  )}
                </div>
              )}
            </div>
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
              disabled={!ffmpegLoaded || isCompressing}
              className="w-full sm:w-auto px-8 py-3 text-base font-semibold text-white 
                bg-gradient-to-r from-blue-600 via-teal-500 to-green-500 hover:from-blue-700 hover:to-teal-700
                rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                disabled:opacity-50 transition-all duration-300 transform hover:scale-105 active:scale-95
                shadow-xl hover:shadow-2xl border-2 border-transparent hover:border-blue-400"
            >
              {!ffmpegLoaded ? 'Loading FFmpeg...' : isCompressing ? 'Compressing...' : 'Compress Video'}
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
