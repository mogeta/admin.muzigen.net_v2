'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Image from 'next/image';
import AuthGuard from '@/components/AuthGuard';
import { blogService } from '@/lib/services/blogService';
import { BlogItem } from '@/lib/types/blog';
import { DocumentSnapshot } from 'firebase/firestore';

const ITEMS_PER_PAGE = 9;

function BlogListContent() {
  const { user, signOut } = useAuth();
  const [blogItems, setBlogItems] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    async function fetchBlogContents() {
      try {
        setLoading(true);
        const result = await blogService.getPaginatedBlogContents(ITEMS_PER_PAGE);
        setBlogItems(result.items);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } catch (err) {
        console.error('Failed to fetch blog contents:', err);
        setError('Failed to load blog contents. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchBlogContents();
  }, []);

  const loadMore = async () => {
    if (!lastDoc || loadingMore) return;

    try {
      setLoadingMore(true);
      const result = await blogService.getPaginatedBlogContents(ITEMS_PER_PAGE, lastDoc);
      setBlogItems(prev => [...prev, ...result.items]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Failed to load more blog contents:', err);
      setError('Failed to load more blog contents. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  };

  const formatDate = (timestamp: import('firebase/firestore').Timestamp) => {
    if (!timestamp) return 'No date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // user is guaranteed to be non-null here because of AuthGuard
  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image
                className="dark:invert"
                src="/next.svg"
                alt="Next.js logo"
                width={80}
                height={16}
              />
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Blog Contents
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {user.displayName || user.email}
                </span>
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Blog Posts
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage and view all blog contents
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-zinc-100"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Blog Items Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg transition-shadow"
              >
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
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && blogItems.length === 0 && (
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
        )}

        {/* Load More Button */}
        {!loading && !error && hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-zinc-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}

        {/* Items Count */}
        {!loading && !error && blogItems.length > 0 && (
          <div className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Showing {blogItems.length} blog post{blogItems.length !== 1 ? 's' : ''}
            {hasMore && ' (more available)'}
          </div>
        )}
      </main>
    </div>
  );
}

export default function BlogList() {
  return (
    <AuthGuard>
      <BlogListContent />
    </AuthGuard>
  );
}
