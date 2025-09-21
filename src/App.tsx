import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ImageProcessor from './components/ImageProcessor';
import { ImageData } from './types';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [images, setImages] = useState<ImageData[]>([]);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleImagesUploaded = (newImages: ImageData[]) => {
    setImages(prev => [...prev, ...newImages]);
  };

  const handleImageRemove = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleImageUpdate = (id: string, updates: Partial<ImageData>) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Image <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Compressor Pro</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Compress, convert, and optimize your images with advanced algorithms. 
                Reduce file sizes while maintaining quality, and download in multiple formats.
              </p>
            </div>

            {images.length === 0 ? (
              <ImageUploader onImagesUploaded={handleImagesUploaded} darkMode={darkMode} />
            ) : (
              <ImageProcessor
                images={images}
                onImageRemove={handleImageRemove}
                onImageUpdate={handleImageUpdate}
                onNewImages={handleImagesUploaded}
                darkMode={darkMode}
              />
            )}
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;