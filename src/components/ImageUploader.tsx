import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, AlertCircle, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { ImageData } from '../types';

interface ImageUploaderProps {
  onImagesUploaded: (images: ImageData[]) => void;
  darkMode: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesUploaded, darkMode }) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    
    try {
      const imagePromises = acceptedFiles.map(async (file) => {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a valid image file`);
          return null;
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB limit
          toast.error(`${file.name} is too large. Maximum size is 50MB`);
          return null;
        }

        const preview = URL.createObjectURL(file);
        
        const imageData: ImageData = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview,
          settings: {
            quality: 80,
            format: 'original',
            compressionMode: 'quality',
          },
        };

        return imageData;
      });

      const validImages = (await Promise.all(imagePromises)).filter(Boolean) as ImageData[];
      
      if (validImages.length > 0) {
        onImagesUploaded(validImages);
        toast.success(`Successfully uploaded ${validImages.length} image${validImages.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      toast.error('Failed to upload images');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  }, [onImagesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp']
    },
    multiple: true
  });

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300 ease-in-out transform hover:scale-[1.02]
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-102 animate-bounce-small' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }
          ${uploading ? 'pointer-events-none opacity-70' : ''}
          bg-white dark:bg-gray-800 shadow-xl animate-scale-up
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className={`
              p-6 rounded-full transition-all duration-300 transform
              ${isDragActive 
                ? 'bg-blue-100 dark:bg-blue-900/30 scale-110' 
                : 'bg-gray-100 dark:bg-gray-700 hover:scale-105'
              }
            `}>
              {uploading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-blue-600"></div>
              ) : (
                <Upload className={`w-12 h-12 transition-transform duration-300 ${
                  isDragActive ? 'text-blue-600 scale-110' : 'text-gray-400 dark:text-gray-500'
                }`} />
              )}
            </div>
          </div>

          <div className="animate-slide-up">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              {isDragActive ? 'Drop your images here' : 'Upload Images to Compress'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">
              {isDragActive ? 'Release to upload files' : 'Drag & drop images here, or click to select files'}
            </p>
            
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-400 dark:text-gray-500">
              <div className="flex items-center space-x-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
                <ImageIcon className="w-4 h-4" />
                <span>JPEG, PNG, WebP, GIF</span>
              </div>
              <div className="flex items-center space-x-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
                <AlertCircle className="w-4 h-4" />
                <span>Max 50MB per file</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={uploading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white 
              bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
              disabled:opacity-50 disabled:cursor-not-allowed 
              transition-all duration-300 transform hover:scale-105 active:scale-95
              shadow-lg hover:shadow-xl"
          >
            <Upload className={`w-5 h-5 mr-2 ${uploading ? 'animate-bounce-small' : ''}`} />
            {uploading ? 'Uploading...' : 'Select Images'}
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-110">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Upload</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drop multiple images or select from device
          </p>
        </div>
        
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in delay-100">
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-110">
            <ImageIcon className="w-6 h-6 text-teal-600" />
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
            Get compressed images in multiple formats
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;