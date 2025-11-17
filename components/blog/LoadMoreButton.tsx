interface LoadMoreButtonProps {
  onLoadMore: () => void;
  isLoadingMore: boolean;
}

export default function LoadMoreButton({ onLoadMore, isLoadingMore }: LoadMoreButtonProps) {
  return (
    <div className="mt-8 flex justify-center">
      <button
        onClick={onLoadMore}
        disabled={isLoadingMore}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-zinc-400 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoadingMore ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Loading...
          </>
        ) : (
          'Load More'
        )}
      </button>
    </div>
  );
}
