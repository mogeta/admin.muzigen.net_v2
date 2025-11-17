interface BlogEditHeaderProps {
  onBack: () => void;
  onTogglePreview: () => void;
  onSave: () => void;
  showPreview: boolean;
  saving: boolean;
  title?: string;
  saveLabel?: string;
}

export default function BlogEditHeader({
  onBack,
  onTogglePreview,
  onSave,
  showPreview,
  saving,
  title = 'Edit Blog Post',
  saveLabel = 'Save Changes',
}: BlogEditHeaderProps) {
  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              ← Back to List
            </button>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePreview}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                showPreview
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'
              }`}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="px-6 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : saveLabel}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
