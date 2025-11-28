import { Timestamp } from 'firebase/firestore';
import { BlogItem } from '@/lib/types/blog';
import Link from 'next/link';
import { FileText, ExternalLink, Calendar, Tag } from 'lucide-react';

interface BlogItemsListProps {
  items: BlogItem[];
}

function formatDate(timestamp: Timestamp) {
  if (!timestamp) return 'No date';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export default function BlogItemsList({ items }: BlogItemsListProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* OGP Image Thumbnail */}
              {item.ogp_image && (
                <div className="flex-shrink-0 w-24 h-16 bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden">
                  <img
                    src={item.ogp_image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title and Status */}
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Metadata and Actions */}
                <div className="flex items-center justify-between mt-3">
                  {/* Left: Status, Tag, Dates */}
                  <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                        item.publish
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}
                    >
                      {item.publish ? 'Published' : 'Draft'}
                    </span>
                    {item.tag && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
                        <Tag size={12} />
                        {item.tag}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(item.update_date)}
                    </span>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/blog/edit/${item.id}`}
                      className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Edit
                    </Link>
                    {item.content_url && (
                      <a
                        href={item.content_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        title="View content"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    {item.markdown_url && (
                      <a
                        href={item.markdown_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                        title="View markdown"
                      >
                        <FileText size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
