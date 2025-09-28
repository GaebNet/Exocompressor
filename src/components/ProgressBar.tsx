interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
}

const ProgressBar = ({ progress, label, showPercentage = true }: ProgressBarProps) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {clampedProgress}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;