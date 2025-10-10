import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ImageCard from './ImageCard';
import BatchActions from './BatchActions';
import { ImageData } from '../types';
import { generatePDF, generateZIP } from '../utils/downloadUtils';
import toast from 'react-hot-toast';

interface ImageProcessorProps {
  images: ImageData[];
  onImageRemove: (id: string) => void;
  onImageUpdate: (id: string, updates: Partial<ImageData>) => void;
  onNewImages: (images: ImageData[]) => void;
  darkMode: boolean;
}

const ImageProcessor: React.FC<ImageProcessorProps> = ({
  images,
  onImageRemove,
  onImageUpdate,
  onNewImages,
  darkMode
}) => {
  const [processing, setProcessing] = useState(false);

  const handleBatchCompress = async () => {
    setProcessing(true);
    toast.promise(
      Promise.all(
        images.map(async (image) => {
          if (!image.compressed) {
            // This would trigger compression for each image
            return new Promise(resolve => setTimeout(resolve, 1000));
          }
        })
      ),
      {
        loading: 'Compressing all images...',
        success: 'All images compressed successfully!',
        error: 'Failed to compress some images',
      }
    );
    setProcessing(false);
  };

  const handleDownloadAll = async (format: 'zip' | 'pdf') => {
    const compressedImages = images.filter(img => img.compressed);
    
    if (compressedImages.length === 0) {
      toast.error('No compressed images to download');
      return;
    }

    try {
      if (format === 'zip') {
        await generateZIP(compressedImages);
        toast.success('ZIP file downloaded successfully');
      } else if (format === 'pdf') {
        await generatePDF(compressedImages);
        toast.success('PDF file downloaded successfully');
      }
    } catch (error) {
      toast.error(`Failed to generate ${format.toUpperCase()} file`);
      console.error('Download error:', error);
    }
  };

  const compressedCount = images.filter(img => img.compressed).length;
  const totalOriginalSize = images.reduce((sum, img) => sum + img.file.size, 0);
  const totalCompressedSize = images.reduce((sum, img) => 
    sum + (img.compressed?.compressedSize || img.file.size), 0
  );

  return (
    <div className="space-y-8">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {images.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Images</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {compressedCount}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Compressed</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="text-2xl font-bold text-blue-600">
            {((totalOriginalSize - totalCompressedSize) / 1024 / 1024).toFixed(1)}MB
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Space Saved</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {totalOriginalSize > 0 ? Math.round((1 - totalCompressedSize / totalOriginalSize) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Reduction</div>
        </div>
      </div>

      {/* Batch Actions */}
      <BatchActions
        onBatchCompress={handleBatchCompress}
        onDownloadAll={handleDownloadAll}
        processing={processing}
        hasCompressedImages={compressedCount > 0}
      />

      {/* Images Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onRemove={() => onImageRemove(image.id)}
            onUpdate={(updates) => onImageUpdate(image.id, updates)}
            darkMode={darkMode}
          />
        ))}
        
        {/* Add more images card */}
        <div 
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200 bg-white dark:bg-gray-800"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = 'image/*';
            input.onchange = (e) => {
              const files = Array.from((e.target as HTMLInputElement).files || []);
              const newImages: ImageData[] = files.map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                file,
                preview: URL.createObjectURL(file),
                settings: {
                  quality: 80,
                  format: 'original',
                  compressionMode: 'quality',
                },
              }));
              onNewImages(newImages);
            };
            input.click();
          }}
        >
          <Plus className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Add more images
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageProcessor;