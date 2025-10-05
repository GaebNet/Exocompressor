import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ImageProcessor from './components/ImageProcessor';
import VideoCompressor from './components/VideoCompressor';
import PdfCompressor from './components/PdfCompressor';
import AudioCompressor from './components/AudioCompressor';
import MobileBottomNav from './components/MobileBottomNav';
import { ImageData } from './types';
import logo from "./images/logo.png";

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'pdf' | 'audio'>('image');
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
    <>
      <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
        darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="flex flex-1 bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="hidden lg:flex flex-col w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-600/20 dark:to-teal-600/20">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Exocompressor
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Advanced media tools
              </p>
            </div>
            <nav className="flex-1 py-6 px-3">
              <div className="space-y-3">

                {/* Image Compression Tab */}
                <button
                  onClick={() => setActiveTab('image')}
                  className={`
                    w-full px-4 py-3 flex items-center text-left rounded-xl
                    transition-all duration-300 transform
                    ${
                      activeTab === 'image'
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg scale-102'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 hover:scale-102'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${activeTab === 'image' ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <svg className={`w-5 h-5 ${activeTab === 'image' ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} 
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">Image Compression</span>
                      <span className={`text-xs ${activeTab === 'image' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                        Optimize images in bulk
                      </span>
                    </div>
                  </div>
                </button>

                {/* Video Compression Tab */}
                <button
                  onClick={() => setActiveTab('video')}
                  className={`
                    w-full px-4 py-3 flex items-center text-left rounded-xl
                    transition-all duration-300 transform
                    ${
                      activeTab === 'video'
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg scale-102'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 hover:scale-102'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${activeTab === 'video' ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <svg className={`w-5 h-5 ${activeTab === 'video' ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} 
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">Video Compression</span>
                      <span className={`text-xs ${activeTab === 'video' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                        Compress videos efficiently
                      </span>
                    </div>
                  </div>
                </button>

                {/* PDF Compression Tab */}
                <button
                  onClick={() => setActiveTab('pdf')}
                  className={`
                    w-full px-4 py-3 flex items-center text-left rounded-xl
                    transition-all duration-300 transform
                    ${
                      activeTab === 'pdf'
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg scale-102'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 hover:scale-102'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${activeTab === 'pdf' ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <svg className={`w-5 h-5 ${activeTab === 'pdf' ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">PDF Compression</span>
                      <span className={`text-xs ${activeTab === 'pdf' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                        Shrink PDF file size
                      </span>
                    </div>
                  </div>
                </button>

                {/* Audio Compression Tab */}
                <button
                  onClick={() => setActiveTab('audio')}
                  className={`
                    w-full px-4 py-3 flex items-center text-left rounded-xl
                    transition-all duration-300 transform
                    ${
                      activeTab === 'audio'
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg scale-102'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 hover:scale-102'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${activeTab === 'audio' ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <svg className={`w-5 h-5 ${activeTab === 'audio' ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">Audio Compression</span>
                      <span className={`text-xs ${activeTab === 'audio' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                        Optimize audio files
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </nav>

          </div>

          <div className="flex-1">
            <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <main className="container px-4 py-8 pb-24 lg:pb-8">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8 sm:mb-12 px-4 sm:px-0">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Exocompressor</span>
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    The next generation media compression tool
                  </p>
                </div>
                

                <div className="block lg:hidden">
                  <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
                </div>

                <div className="mb-8">
                  {activeTab === 'video' ? (
                    <VideoCompressor />
                  ) : activeTab === 'pdf' ? (
                    <PdfCompressor />
                  ) : activeTab === 'audio' ? (
                    <AudioCompressor />
                  ) : (
                    images.length === 0 ? (
                      <ImageUploader onImagesUploaded={handleImagesUploaded} />
                    ) : (
                      <ImageProcessor
                        images={images}
                        onImageRemove={handleImageRemove}
                        onImageUpdate={handleImageUpdate}
                        onNewImages={handleImagesUploaded}
                        darkMode={darkMode}
                      />
                    )
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>

        <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 flex items-center justify-center gap-3 mt-8">
          <img src={logo} alt="GaebNet Org Logo" className="h-7 w-7 rounded-full border" />
          <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">Developed by GaebNet Org</span>
          <a href="https://github.com/GaebNet" target="_blank" rel="noopener noreferrer" className="ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-gray-700 dark:text-white hover:text-blue-600">
              <path d="M12 2C6.477 2 2 6.484 2 12.012c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.529 2.341 1.088 2.91.833.091-.646.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.254-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.396.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.579.688.481C19.138 20.174 22 16.426 22 12.012 22 6.484 17.523 2 12 2z" />
            </svg>
          </a>
        </footer>
      </div>
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <Toaster position="top-right" />
    </>
  );
};

export default App;