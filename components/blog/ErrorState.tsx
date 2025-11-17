interface ErrorStateProps {
  error: Error;
  onRetry: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-red-800 dark:text-red-200 font-semibold mb-1">
            Failed to load blog contents
          </h3>
          <p className="text-red-700 dark:text-red-300 text-sm">
            {error.message || 'An error occurred while fetching data.'}
          </p>
        </div>
        <button
          onClick={onRetry}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
