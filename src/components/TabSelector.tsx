
interface TabSelectorProps {
  activeTab: 'image' | 'video' | 'pdf';
  onTabChange: (tab: 'image' | 'video' | 'pdf') => void;
}


const TabSelector = ({ activeTab, onTabChange }: TabSelectorProps) => {
  return (
    <div className="flex space-x-4 mb-6 animate-fade-in">
      <button
        className={`
          px-6 py-2.5 rounded-lg font-medium
          transition-all duration-300 transform
          shadow-md hover:shadow-lg
          ${
            activeTab === 'image'
              ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white scale-105 hover:from-blue-700 hover:to-teal-700'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }
          hover:scale-105 active:scale-95
        `}
        onClick={() => onTabChange('image')}
      >
        <span className={`inline-block transition-transform duration-300 ${activeTab === 'image' ? 'animate-bounce-small' : ''}`}>
          Image Compression
        </span>
      </button>
      <button
        className={`
          px-6 py-2.5 rounded-lg font-medium
          transition-all duration-300 transform
          shadow-md hover:shadow-lg
          ${
            activeTab === 'video'
              ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white scale-105 hover:from-blue-700 hover:to-teal-700'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }
          hover:scale-105 active:scale-95
        `}
        onClick={() => onTabChange('video')}
      >
        <span className={`inline-block transition-transform duration-300 ${activeTab === 'video' ? 'animate-bounce-small' : ''}`}>
          Video Compression
        </span>
      </button>
      <button
        className={`
          px-6 py-2.5 rounded-lg font-medium
          transition-all duration-300 transform
          shadow-md hover:shadow-lg
          ${
            activeTab === 'pdf'
              ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white scale-105 hover:from-blue-700 hover:to-teal-700'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }
          hover:scale-105 active:scale-95
        `}
        onClick={() => onTabChange('pdf')}
      >
        <span className={`inline-block transition-transform duration-300 ${activeTab === 'pdf' ? 'animate-bounce-small' : ''}`}>
          PDF Compression
        </span>
      </button>
    </div>
  );
};

export default TabSelector;
