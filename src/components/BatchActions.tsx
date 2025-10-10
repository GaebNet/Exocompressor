import React from 'react';
import { FileText, Archive, Zap } from 'lucide-react';

interface BatchActionsProps {
  onBatchCompress: (quality: number) => void;
  onDownloadAll: (format: 'zip' | 'pdf') => void;
  processing: boolean;
  hasCompressedImages: boolean;
}

const BatchActions: React.FC<BatchActionsProps> = ({
  onBatchCompress,
  onDownloadAll,
  processing,
  hasCompressedImages
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Batch Actions
      </h3>
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onBatchCompress(80)}
          disabled={processing}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        >
          <Zap className="w-4 h-4 mr-2" />
          Compress All
        </button>
        
        <button
          onClick={() => onDownloadAll('zip')}
          disabled={!hasCompressedImages}
          className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          <Archive className="w-4 h-4 mr-2" />
          Download ZIP
        </button>
        
        <button
          onClick={() => onDownloadAll('pdf')}
          disabled={!hasCompressedImages}
          className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          <FileText className="w-4 h-4 mr-2" />
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default BatchActions;