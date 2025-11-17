import { Timestamp } from 'firebase/firestore';
import { BlogItem } from '@/lib/types/blog';

interface BlogItemCardProps {
  item: BlogItem;
}

function formatDate(timestamp: Timestamp) {
  if (!timestamp) return 'No date';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default function BlogItemCard({ item }: BlogItemCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg transition-shadow">
      {/* OGP Image */}
      {item.ogp_image && (
        <div className="relative w-full h-48 bg-zinc-100 dark:bg-zinc-800">
          <img
            src={item.ogp_image}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              item.publish
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            {item.publish ? 'Published' : 'Draft'}
          </span>
          {item.tag && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {item.tag}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3">
          {item.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex flex-col gap-1">
            <span>Created: {formatDate(item.created_date)}</span>
            <span>Updated: {formatDate(item.update_date)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <a
            href={`/blog/edit/${item.id}`}
            className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            Edit
          </a>
          {item.content_url && (
            <a
              href={item.content_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              View
            </a>
          )}
          {item.markdown_url && (
            <a
              href={item.markdown_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 text-sm bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors text-center"
            >
              Markdown
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
