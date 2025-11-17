'use client';

import useSWRInfinite from 'swr/infinite';
import { blogService } from '@/lib/services/blogService';
import { BlogItem } from '@/lib/types/blog';
import { DocumentSnapshot } from 'firebase/firestore';

const ITEMS_PER_PAGE = 9;

interface PaginatedBlogData {
  items: BlogItem[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * Custom hook to fetch paginated blog contents using SWR Infinite
 *
 * Benefits over useEffect:
 * - Automatic caching
 * - Automatic revalidation
 * - Deduplication of requests
 * - Error retry
 * - Focus revalidation
 * - Network status revalidation
 * - Built-in pagination support
 *
 * @returns SWR Infinite response with blog data, loading, error states and pagination functions
 *
 * @example
 * function BlogList() {
 *   const { data, error, isLoading, size, setSize, isLoadingMore, isReachingEnd } = usePaginatedBlogContents();
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error />;
 *
 *   const allItems = data ? data.flatMap(page => page.items) : [];
 *
 *   return (
 *     <div>
 *       {allItems.map(item => <BlogCard key={item.id} item={item} />)}
 *       {!isReachingEnd && (
 *         <button onClick={() => setSize(size + 1)} disabled={isLoadingMore}>
 *           Load More
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 */
export function usePaginatedBlogContents() {
  const getKey = (pageIndex: number, previousPageData: PaginatedBlogData | null) => {
    // If reached the end, return null to stop fetching
    if (previousPageData && !previousPageData.hasMore) return null;

    // First page, no previous data
    if (pageIndex === 0) return ['blog-contents-paginated', 0];

    // Add the lastDoc to the key for subsequent pages
    return ['blog-contents-paginated', pageIndex, previousPageData?.lastDoc];
  };

  const { data, error, size, setSize, isLoading, isValidating } = useSWRInfinite<PaginatedBlogData>(
    getKey,
    async ([, , lastDoc]: [string, number, DocumentSnapshot?]) => {
      const result = await blogService.getPaginatedBlogContents(ITEMS_PER_PAGE, lastDoc);
      return result;
    },
    {
      revalidateOnFocus: false,     // Don't revalidate on focus for paginated data
      revalidateOnReconnect: true,  // Revalidate on reconnect
      revalidateFirstPage: true,    // Revalidate the first page
      errorRetryCount: 3,           // Retry 3 times on error
      shouldRetryOnError: true,     // Retry on error
    }
  );

  const isLoadingMore = isValidating && data && typeof data[size - 1] !== 'undefined';
  const isEmpty = data?.[0]?.items.length === 0;
  const isReachingEnd = isEmpty || (data && !data[data.length - 1]?.hasMore);

  return {
    data,
    error,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    size,
    setSize,
    // Helper to get all items flattened
    allItems: data ? data.flatMap(page => page.items) : [],
  };
}
