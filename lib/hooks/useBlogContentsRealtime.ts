'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { BlogItem } from '@/lib/types/blog';

/**
 * Custom hook to fetch blog contents using Firebase Realtime Listener
 *
 * This is an alternative to useBlogContents that provides real-time updates.
 * Use this when you need instant updates when data changes in Firestore.
 *
 * Note: This will increase Firestore read costs as it listens for changes.
 *
 * @returns Blog data, loading, and error states
 *
 * @example
 * function BlogList() {
 *   const { data, loading, error } = useBlogContentsRealtime();
 *
 *   if (loading) return <Loading />;
 *   if (error) return <Error message={error} />;
 *
 *   return (
 *     <div>
 *       {data.map(item => <BlogCard key={item.id} item={item} />)}
 *     </div>
 *   );
 * }
 */
export function useBlogContentsRealtime() {
  const [data, setData] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Firestoreのクエリを作成
    const q = query(
      collection(firestore, 'blog_contents'),
      orderBy('update_date', 'desc')
    );

    // リアルタイムリスナーを設定
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BlogItem[];

        setData(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Failed to fetch blog contents:', err);
        setError(err.message || 'Failed to load blog contents');
        setLoading(false);
      }
    );

    // クリーンアップ関数：コンポーネントのアンマウント時にリスナーを解除
    return () => unsubscribe();
  }, []);

  return {
    data,
    loading,
    error,
  };
}
