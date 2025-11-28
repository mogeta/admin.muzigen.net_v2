'use client';

import { useAuth } from '@/lib/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { usePaginatedBlogContents } from '@/lib/hooks/usePaginatedBlogContents';
import BlogHeader from '@/components/blog/BlogHeader';
import BlogPageHeader from '@/components/blog/BlogPageHeader';
import LoadingState from '@/components/blog/LoadingState';
import ErrorState from '@/components/blog/ErrorState';
import BlogItemsGrid from '@/components/blog/BlogItemsGrid';
import BlogItemsList from '@/components/blog/BlogItemsList';
import EmptyState from '@/components/blog/EmptyState';
import LoadMoreButton from '@/components/blog/LoadMoreButton';
import ItemsCount from '@/components/blog/ItemsCount';
import { ViewMode } from '@/components/blog/ViewToggle';
import { useState, useEffect } from 'react';

function BlogListContent() {
  const { user, signOut } = useAuth();

  // ✅ 表示モードの状態管理（localStorageで永続化）
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    const savedViewMode = localStorage.getItem('blogViewMode') as ViewMode;
    if (savedViewMode === 'grid' || savedViewMode === 'list') {
      setViewMode(savedViewMode);
    }
  }, []);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('blogViewMode', mode);
  };

  // ✅ SWR Infiniteを使用したページネーション対応データフェッチング
  const {
    allItems: blogItems,
    error,
    isLoading: loading,
    isLoadingMore,
    isReachingEnd,
    size,
    setSize,
    mutate
  } = usePaginatedBlogContents();

  const loadMore = () => {
    setSize(size + 1);
  };

  // user is guaranteed to be non-null here because of AuthGuard
  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <BlogHeader user={user} onSignOut={signOut} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BlogPageHeader
          onRefresh={() => mutate()}
          isLoading={loading}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />

        {loading && <LoadingState />}

        {error && <ErrorState error={error} onRetry={() => mutate()} />}

        {!loading && !error && viewMode === 'grid' && <BlogItemsGrid items={blogItems} />}
        {!loading && !error && viewMode === 'list' && <BlogItemsList items={blogItems} />}

        {!loading && !error && blogItems.length === 0 && <EmptyState />}

        {!loading && !error && !isReachingEnd && (
          <LoadMoreButton onLoadMore={loadMore} isLoadingMore={isLoadingMore} />
        )}

        {!loading && !error && blogItems.length > 0 && (
          <ItemsCount count={blogItems.length} hasMore={!isReachingEnd} />
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
