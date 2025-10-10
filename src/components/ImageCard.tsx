import React, { useState, useCallback } from 'react';
import { Download, X, Settings, Image as ImageIcon, Zap, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { ImageData } from '../types';
import { formatFileSize } from '../utils/formatters';
import { downloadImage } from '../utils/downloadUtils';

interface ImageCardProps {
  image: ImageData;
  onRemove: () => void;
  onUpdate: (updates: Partial<ImageData>) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onRemove, onUpdate }) => {
  const [compressing, setCompressing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const hasSettingsChanged = useCallback(() => {
    if (!image.compressed || !image.compressionSettingsUsed) return false;
    
    return JSON.stringify(image.settings) !== JSON.stringify(image.compressionSettingsUsed);
  }, [image.settings, image.compressed, image.compressionSettingsUsed]);

  const compressImage = useCallback(async () => {
    if (compressing) return;
    
    setCompressing(true);
    
    try {
      let options;
      
      if (image.settings.compressionMode === 'fileSize' && image.settings.targetSizeMB) {
        // Compress to target file size
        options = {
          maxSizeMB: image.settings.targetSizeMB,
          maxWidthOrHeight: image.settings.maxWidth || 1920,
          useWebWorker: true,
          initialQuality: 0.9,
        };
      } else {
        // Compress by quality
        options = {
          maxSizeMB: 1,
          maxWidthOrHeight: image.settings.maxWidth || 1920,
          useWebWorker: true,
          initialQuality: image.settings.quality / 100,
        };
      }

      const compressedFile = await imageCompression(image.file, options);
      const compressedPreview = URL.createObjectURL(compressedFile);
      
      const compressionRatio = (1 - compressedFile.size / image.file.size) * 100;
      
      onUpdate({
        compressed: {
          file: compressedFile,
          preview: compressedPreview,
          compressionRatio,
          originalSize: image.file.size,
          compressedSize: compressedFile.size,
        },
        compressionSettingsUsed: { ...image.settings },
      });

      const targetText = image.settings.compressionMode === 'fileSize' 
        ? `to ${formatFileSize(compressedFile.size)}`
        : `by ${compressionRatio.toFixed(1)}%`;
      toast.success(`Compressed ${image.file.name} ${targetText}`);
    } catch (error) {
      toast.error('Failed to compress image');
      console.error('Compression error:', error);
    } finally {
      setCompressing(false);
    }
  }, [image, onUpdate, compressing]);

  const handleDownload = (format: 'original' | 'compressed') => {
    if (format === 'compressed' && !image.compressed) {
      toast.error('Image not compressed yet');
      return;
    }
    
    const fileToDownload = format === 'compressed' ? image.compressed!.file : image.file;
    downloadImage(fileToDownload, image.file.name);
    toast.success('Download started');
  };

  const handleQualityChange = (quality: number) => {
    onUpdate({
      settings: {
        ...image.settings,
        quality,
        compressionMode: 'quality',
      },
    });
  };

  const handleTargetSizeChange = (targetSizeMB: number) => {
    onUpdate({
      settings: {
        ...image.settings,
        targetSizeMB,
        compressionMode: 'fileSize',
      },
    });
  };

  const handleCompressionModeChange = (mode: 'quality' | 'fileSize') => {
    onUpdate({
      settings: {
        ...image.settings,
        compressionMode: mode,
      },
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg">
      {/* Image Preview */}
      <div 
        className="relative aspect-square bg-gray-100 dark:bg-gray-700"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          src={image.compressed && isHovering ? image.preview : (image.compressed?.preview || image.preview)}
          alt={image.file.name}
          className="w-full h-full object-cover transition-opacity duration-200"
          loading="lazy"
        />
        
        {/* Hover indicator */}
        {image.compressed && isHovering && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">
            Original
          </div>
        )}
        {image.compressed && !isHovering && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-600 text-white text-xs rounded">
            Compressed
          </div>
        )}
        
        {/* Overlay actions */}
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
            onClick={onRemove}
            className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 bg-gray-900 bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Compression status */}
        {image.compressed && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
            -{image.compressed.compressionRatio.toFixed(1)}%
          </div>
        )}
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Compression Mode
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCompressionModeChange('quality')}
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                    image.settings.compressionMode === 'quality'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  By Quality
                </button>
                <button
                  onClick={() => handleCompressionModeChange('fileSize')}
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                    image.settings.compressionMode === 'fileSize'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  By File Size
                </button>
              </div>
            </div>

            {image.settings.compressionMode === 'quality' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quality: {image.settings.quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={image.settings.quality}
                onChange={(e) => handleQualityChange(Number(e.target.value))}
                className="w-full"
              />
            </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target File Size
                </label>
                <div className="space-y-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Original: {formatFileSize(image.file.size)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0.1"
                      max={Math.ceil(image.file.size / 1024 / 1024)}
                      step="0.1"
                      value={image.settings.targetSizeMB || 1}
                      onChange={(e) => handleTargetSizeChange(Number(e.target.value))}
                      className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">MB</span>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 5, 10].map((size) => (
                      <button
                        key={size}
                        onClick={() => handleTargetSizeChange(size)}
                        className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        {size}MB
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Format
              </label>
              <select
                value={image.settings.format}
                onChange={(e) => onUpdate({
                  settings: {
                    ...image.settings,
                    format: e.target.value as 'original' | 'jpeg' | 'png' | 'webp',
                  },
                })}
                className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="original">Original</option>
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Image info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-white truncate mb-2">
          {image.file.name}
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div>
            <span className="block">Original</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatFileSize(image.file.size)}
            </span>
          </div>
          
          {image.compressed && (
            <div>
              <span className="block">Compressed</span>
              <span className="font-medium text-green-600">
                {formatFileSize(image.compressed.compressedSize)}
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2">
          {!image.compressed ? (
            <button
              onClick={compressImage}
              disabled={compressing}
              className={`flex-1 flex items-center justify-center px-3 py-2 text-white rounded-lg transition-colors ${
                image.settings.compressionMode === 'fileSize'
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                  : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
              }`}
            >
              {compressing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <>
                  {image.settings.compressionMode === 'fileSize' ? (
                    <Target className="w-4 h-4 mr-2" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                </>
              )}
              {compressing 
                ? 'Compressing...' 
                : image.settings.compressionMode === 'fileSize'
                  ? `Compress to ${image.settings.targetSizeMB || 1}MB`
                  : 'Compress'
              }
            </button>
          ) : (
            <>
              {hasSettingsChanged() ? (
                <button
                  onClick={compressImage}
                  disabled={compressing}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
                >
                  {compressing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  {compressing ? 'Recompressing...' : 'Recompress'}
                </button>
              ) : (
                <button
                  onClick={() => handleDownload('compressed')}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              )}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                title="Adjust compression settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDownload('original')}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                title="Download original"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCard;