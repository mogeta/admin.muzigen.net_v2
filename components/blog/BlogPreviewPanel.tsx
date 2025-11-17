import MarkdownPreview from '@/components/blog/MarkdownPreview';

interface BlogPreviewPanelProps {
  title: string;
  description: string;
  tag: string;
  ogpImage: string;
  content: string;
}

export default function BlogPreviewPanel({
  title,
  description,
  tag,
  ogpImage,
  content,
}: BlogPreviewPanelProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
      <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
        Preview
      </h2>
      {ogpImage && (
        <div className="mb-4">
          <img
            src={ogpImage}
            alt={title}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}
      <h3 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">
        {title || 'Untitled'}
      </h3>
      <p className="text-zinc-600 dark:text-zinc-400 mb-4">
        {description || 'No description'}
      </p>
      {tag && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mb-4">
          {tag}
        </span>
      )}
      <div className="mt-6">
        <MarkdownPreview content={content || '*No content yet*'} />
      </div>
    </div>
  );
}
