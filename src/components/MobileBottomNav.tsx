import React from 'react';
import { Image as ImageIcon, Video, FileText, Music } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'image' | 'video' | 'pdf' | 'audio';
  onTabChange: (tab: 'image' | 'video' | 'pdf' | 'audio') => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'image' as const,
      label: 'Image',
      icon: ImageIcon,
    },
    {
      id: 'video' as const,
      label: 'Video',
      icon: Video,
    },
    {
      id: 'pdf' as const,
      label: 'PDF',
      icon: FileText,
    },
    {
      id: 'audio' as const,
      label: 'Audio',
      icon: Music,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg lg:hidden">
      <div className="flex items-center justify-around py-2 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 transform
                ${isActive
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white scale-105 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
                }
                active:scale-95
              `}
              aria-label={tab.label}
            >
              <Icon
                className={`w-6 h-6 mb-1 transition-transform duration-200 ${
                  isActive ? 'scale-110' : ''
                }`}
              />
              <span className={`text-xs font-medium transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;