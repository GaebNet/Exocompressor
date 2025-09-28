import { useState, useRef } from 'react';
import { Upload, Music, AlertCircle, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AudioCompressor = () => {
  const [audio, setAudio] = useState<File | null>(null);
  const [compressedAudio, setCompressedAudio] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [removeCoverPhoto, setRemoveCoverPhoto] = useState(false);
  const [removeArtist, setRemoveArtist] = useState(false);
  const [removeAlbum, setRemoveAlbum] = useState(false);
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

  const handleAudioSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('audio/')) {
      setAudio(file);
      setCompressedAudio(null);
      setOriginalSize(file.size);
      setCompressedSize(null);
      toast.success('Audio file selected successfully');
    } else {
      toast.error('Please select a valid audio file');
    }
  };

  const handleCompression = async () => {
    if (!audio) return;
    setIsCompressing(true);
    try {
      // Simulate compression
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Calculate reduction based on options
      let reductionFactor = 0.8; // Base 20% reduction
      if (removeCoverPhoto) reductionFactor *= 0.9; // Additional 10% reduction
      if (removeArtist) reductionFactor *= 0.95; // Additional 5% reduction
      if (removeAlbum) reductionFactor *= 0.95; // Additional 5% reduction

      const simulatedCompressedSize = audio.size * reductionFactor;
      setCompressedSize(simulatedCompressedSize);
      const url = URL.createObjectURL(audio);
      setCompressedAudio(url);
      toast.success('Audio compressed successfully!');
    } catch (error) {
      toast.error('Error compressing audio');
      console.error(error);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto p-4 md:p-8 bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
      {/* Upload Area */}
      <div className="flex items-center justify-center w-full mb-8">
        <label
          htmlFor="audio-upload"
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
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-blue-600"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                Processing audio...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className={`p-6 rounded-full transition-all duration-300 transform ${isDragActive ? 'bg-blue-100 dark:bg-blue-900/30 scale-110' : 'bg-gray-100 dark:bg-gray-700 hover:scale-105'}`}>
                  <Music className={`w-12 h-12 transition-transform duration-300 ${isDragActive ? 'text-blue-600 scale-110' : 'text-gray-400 dark:text-gray-500'}`} />
                </div>
              </div>
              <div className="animate-slide-up">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                  {isDragActive ? 'Drop your audio files here' : 'Upload Audio to Compress'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">
                  {isDragActive ? 'Release to upload files' : 'Drag & drop audio here, or click to select files'}
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-400 dark:text-gray-500">
                  <div className="flex items-center space-x-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
                    <Music className="w-4 h-4" />
                    <span>MP3, WAV, FLAC</span>
                  </div>
                  <div className="flex items-center space-x-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
                    <AlertCircle className="w-4 h-4" />
                    <span>Max 100MB per file</span>
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
                  {isCompressing ? 'Uploading...' : 'Select Audio'}
                </button>
              </div>
            </div>
          )}
          <input
            id="audio-upload"
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleAudioSelect}
            disabled={isCompressing}
          />
        </label>
      </div>

      {audio && !isCompressing && (
        <div className="space-y-6 animate-slide-up">
          {/* Compression Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-md">
            <div className="flex items-center bg-blue-100 dark:bg-blue-900/40 px-4 py-3 rounded-xl shadow border border-blue-300 dark:border-blue-700">
              <input
                id="remove-cover"
                type="checkbox"
                checked={removeCoverPhoto}
                onChange={e => setRemoveCoverPhoto(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600 focus:ring-blue-500 mr-3 accent-blue-600"
              />
              <label htmlFor="remove-cover" className="text-base font-semibold text-blue-800 dark:text-blue-200 select-none cursor-pointer">
                Remove Cover Photo
              </label>
            </div>
            <div className="flex items-center bg-teal-100 dark:bg-teal-900/40 px-4 py-3 rounded-xl shadow border border-teal-300 dark:border-teal-700">
              <input
                id="remove-artist"
                type="checkbox"
                checked={removeArtist}
                onChange={e => setRemoveArtist(e.target.checked)}
                className="form-checkbox h-5 w-5 text-teal-600 focus:ring-teal-500 mr-3 accent-teal-600"
              />
              <label htmlFor="remove-artist" className="text-base font-semibold text-teal-800 dark:text-teal-200 select-none cursor-pointer">
                Remove Artist
              </label>
            </div>
            <div className="flex items-center bg-purple-100 dark:bg-purple-900/40 px-4 py-3 rounded-xl shadow border border-purple-300 dark:border-purple-700">
              <input
                id="remove-album"
                type="checkbox"
                checked={removeAlbum}
                onChange={e => setRemoveAlbum(e.target.checked)}
                className="form-checkbox h-5 w-5 text-purple-600 focus:ring-purple-500 mr-3 accent-purple-600"
              />
              <label htmlFor="remove-album" className="text-base font-semibold text-purple-800 dark:text-purple-200 select-none cursor-pointer">
                Remove Album
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6
            bg-gradient-to-br from-blue-50/80 via-white/80 to-teal-50/80 dark:from-gray-800/80 dark:via-gray-900/80 dark:to-gray-800/80
            rounded-2xl shadow-lg hover:shadow-2xl
            transition-all duration-300 transform hover:scale-102 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Music className="w-8 h-8 text-blue-500 dark:text-blue-400 transition-colors duration-300" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{audio.name}</p>
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
              Compress Audio
            </button>
          </div>

          {compressedAudio && (
            <div className="flex flex-col items-center animate-scale-up">
              <a
                href={compressedAudio}
                download={audio ? `compressed_${audio.name}` : 'compressed_audio.mp3'}
                className="mb-6 inline-block px-6 py-2.5 text-base font-semibold text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-transparent hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Download Audio
              </a>
            </div>
          )}
        </div>
      )}
      {/* Features Bar - at the bottom */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-110">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Upload</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drop audio or select from device
          </p>
        </div>
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in delay-100">
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-110">
            <Music className="w-6 h-6 text-teal-600" />
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
            Save your optimized audio
          </p>
        </div>
      </div>
    </div>
  );
};

export default AudioCompressor;