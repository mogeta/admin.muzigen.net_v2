export default function EmptyState() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
      <svg
        className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
        No blog posts found
      </h3>
      <p className="text-zinc-600 dark:text-zinc-400">
        Get started by creating your first blog post.
      </p>
    </div>
  );
}
