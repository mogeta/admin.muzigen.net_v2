# データフェッチングのベストプラクティス

## 現在の問題点

`blog/page.tsx` で使用している `useEffect` パターンには以下の問題があります：

```tsx
// ❌ 避けるべきパターン
useEffect(() => {
  async function fetchData() {
    const data = await fetchSomething();
    setData(data);
  }
  fetchData();
}, []);
```

### 問題点

1. **レースコンディション**: 複数の非同期リクエストが順不同で完了する可能性
2. **キャッシングなし**: 同じデータを何度も取得
3. **重複リクエスト**: コンポーネントの再マウント時に重複リクエスト
4. **エラーハンドリングの複雑さ**: 手動でエラー状態を管理
5. **再検証なし**: データの鮮度を保つ仕組みがない
6. **SSR時の問題**: サーバーサイドで実行されない

---

## Next.js App Router のベストプラクティス

### パターン1: Server Components（最も推奨）

**いつ使う？**
- 認証不要のページ
- 静的なデータ
- SEOが重要なページ

```tsx
// app/posts/page.tsx
// 'use client' なし = Server Component

async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    cache: 'no-store', // または 'force-cache', next: { revalidate: 60 }
  });
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

**メリット:**
- ✅ サーバーで実行されるため高速
- ✅ SEO フレンドリー
- ✅ 環境変数やシークレットに直接アクセス可能
- ✅ データベースクエリを直接実行可能

**デメリット:**
- ❌ クライアントサイドのインタラクションができない
- ❌ useState, useEffect などのフックが使えない

---

### パターン2: SWR（Client Componentsでの推奨）

**いつ使う？**
- クライアントサイドでのデータフェッチ
- リアルタイム性が必要
- ユーザーインタラクションが必要

```tsx
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function PostsPage() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/posts',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={() => mutate()}>Refresh</button>
      {data.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

**メリット:**
- ✅ 自動キャッシング
- ✅ 自動再検証（フォーカス時、再接続時など）
- ✅ エラーリトライ
- ✅ オプティミスティックUI
- ✅ 重複排除
- ✅ レースコンディション解決

---

### パターン3: TanStack Query（React Query）

**いつ使う？**
- より高度なキャッシュ制御が必要
- Mutation（POST, PUT, DELETE）が多い
- 複雑な状態管理が必要

```tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function PostsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('/api/posts');
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: (newPost) => {
      return fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify(newPost),
      });
    },
    onSuccess: () => {
      // キャッシュを無効化して再フェッチ
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
      <button onClick={() => mutation.mutate({ title: 'New Post' })}>
        Add Post
      </button>
    </div>
  );
}
```

**メリット:**
- ✅ SWRの全機能 + より高度な制御
- ✅ Mutation機能が強力
- ✅ 並列クエリ、依存クエリのサポート
- ✅ DevTools

---

### パターン4: Firebase Realtime Listener

**いつ使う？**
- Firestore/Realtime Databaseを使用
- リアルタイム更新が必要

```tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, 'posts'),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

**メリット:**
- ✅ リアルタイム更新
- ✅ Firebaseとの統合が簡単
- ✅ 自動クリーンアップ

**デメリット:**
- ❌ Firebase専用
- ❌ コスト（読み取り回数が増える）

---

## 推奨される選択フロー

```
認証が不要か？
├─ YES → Server Components（パターン1）
└─ NO
    └─ リアルタイム更新が必要か？
        ├─ YES → Firebase Listener（パターン4）
        └─ NO
            └─ Mutationが多いか？
                ├─ YES → TanStack Query（パターン3）
                └─ NO → SWR（パターン2）
```

---

## blog/page.tsx への適用

現在の `blog/page.tsx` は **認証が必要** で **Firestoreを使用** しているため、以下の選択肢があります：

### 選択肢1: SWR（推奨）
- シンプル
- キャッシングと再検証
- エラーハンドリング

### 選択肢2: Firebase Listener
- リアルタイム更新が必要な場合
- ただし、読み取りコストが増加

### 選択肢3: TanStack Query
- ブログの追加・編集・削除機能を実装する予定がある場合

---

## まとめ

**useEffectでのデータフェッチは避けるべき**です。代わりに：

1. **Server Components**: 可能な限り使用
2. **SWR**: Client Componentsでのシンプルなフェッチ
3. **TanStack Query**: 複雑な状態管理やMutation
4. **Firebase Listener**: リアルタイム性が必要な場合

これらのツールは、キャッシング、再検証、エラーハンドリングなどを自動的に処理してくれます。
