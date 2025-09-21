import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ImageProcessor from './components/ImageProcessor';
import { ImageData } from './types';
import logo from "./images/logo.png";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [images, setImages] = useState<ImageData[]>([]);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      <footer className="w-full bg-white border-t border-gray-200 py-4 flex items-center justify-center gap-2 mt-8">
        <span className="text-gray-600 text-sm">Developed by GeabNet Org</span>
        <a href="https://github.com/GaebNet" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
          <img src={logo} alt="GeabNet Org Logo" className="h-6 w-6 rounded-full border" />
          <span className="text-blue-600 text-sm underline">GitHub</span>
        </a>
      </footer>
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
      <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 flex items-center justify-center gap-3 mt-8">
        <img src={logo} alt="GeabNet Org Logo" className="h-7 w-7 rounded-full border" />
        <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">Developed by GeabNet Org</span>
        <a href="https://github.com/GaebNet" target="_blank" rel="noopener noreferrer" className="ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-gray-700 dark:text-white hover:text-blue-600">
            <path d="M12 2C6.477 2 2 6.484 2 12.012c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.529 2.341 1.088 2.91.833.091-.646.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.254-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.396.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.579.688.481C19.138 20.174 22 16.426 22 12.012 22 6.484 17.523 2 12 2z" />
          </svg>
        </a>
      </footer>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;