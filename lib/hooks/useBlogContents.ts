'use client';

import useSWR from 'swr';
import { blogService } from '@/lib/services/blogService';
import { BlogItem } from '@/lib/types/blog';

/**
 * Custom hook to fetch blog contents using SWR
 *
 * Benefits over useEffect:
 * - Automatic caching
 * - Automatic revalidation
 * - Deduplication of requests
 * - Error retry
 * - Focus revalidation
 * - Network status revalidation
 *
 * @returns SWR response with blog data, loading, error states and mutate function
 *
 * @example
 * function BlogList() {
 *   const { data, error, isLoading, mutate } = useBlogContents();
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error />;
 *
 *   return (
 *     <div>
 *       <button onClick={() => mutate()}>Refresh</button>
 *       {data.map(item => <BlogCard key={item.id} item={item} />)}
 *     </div>
 *   );
 * }
 */
export function useBlogContents() {
  const { data, error, isLoading, mutate } = useSWR<BlogItem[]>(
    'blog-contents', // キャッシュキー
    async () => {
      const items = await blogService.getBlogContents();
      return items;
    },
    {
      // オプション設定
      revalidateOnFocus: true,      // タブにフォーカスした時に再検証
      revalidateOnReconnect: true,  // ネットワーク再接続時に再検証
      dedupingInterval: 2000,       // 2秒間は重複リクエストを排除
      errorRetryCount: 3,           // エラー時に3回までリトライ
      shouldRetryOnError: true,     // エラー時にリトライする
    }
  );

  return {
    data: data ?? [],
    error,
    isLoading,
    mutate, // 手動で再フェッチする関数
  };
}
