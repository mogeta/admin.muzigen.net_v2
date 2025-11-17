# blog/page.tsx の改善内容

## 問題点

以前の実装では `useEffect` を使用してデータフェッチングを行っていました：

```tsx
// ❌ 以前のコード（問題あり）
const [blogItems, setBlogItems] = useState<BlogItem[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  async function fetchBlogContents() {
    try {
      setLoading(true);
      const items = await blogService.getBlogContents();
      setBlogItems(items);
    } catch (err) {
      setError('Failed to load blog contents');
    } finally {
      setLoading(false);
    }
  }
  fetchBlogContents();
}, []);
```

### この実装の問題点

1. **キャッシングなし**: ページを離れて戻ると毎回再フェッチ
2. **重複リクエスト**: コンポーネントの再マウント時に重複リクエストが発生
3. **再検証なし**: データの鮮度を保つ仕組みがない
4. **レースコンディション**: 複数のリクエストが順不同で完了する可能性
5. **手動でのエラーハンドリング**: エラー状態を手動で管理
6. **再試行機能なし**: エラー時の自動リトライがない

---

## 改善後の実装

SWRを使用したデータフェッチングに変更：

```tsx
// ✅ 改善後のコード
const { data: blogItems, error, isLoading: loading, mutate } = useBlogContents();
```

### カスタムフック: `useBlogContents`

```tsx
// lib/hooks/useBlogContents.ts
export function useBlogContents() {
  const { data, error, isLoading, mutate } = useSWR<BlogItem[]>(
    'blog-contents',
    async () => {
      const items = await blogService.getBlogContents();
      return items;
    },
    {
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
    mutate,
  };
}
```

---

## 追加された機能

### 1. Refreshボタン

SWRの `mutate` 関数を使用して、手動でデータを再フェッチできるようになりました：

```tsx
<button onClick={() => mutate()} disabled={loading}>
  Refresh
</button>
```

### 2. 改善されたエラーハンドリング

エラー時に「Retry」ボタンが表示されるようになりました：

```tsx
{error && (
  <div>
    <h3>Failed to load blog contents</h3>
    <p>{error.message}</p>
    <button onClick={() => mutate()}>Retry</button>
  </div>
)}
```

---

## SWRのメリット

### 自動キャッシング
- 一度取得したデータはキャッシュされます
- 同じデータを何度もフェッチしません

### 自動再検証
- ウィンドウにフォーカスした時
- ネットワークが再接続された時
- 指定した間隔で

### 重複排除
- 同時に複数のコンポーネントが同じデータを要求しても、1回のリクエストで済みます

### エラーリトライ
- エラーが発生した場合、自動的に再試行します

### オプティミスティックUI
- `mutate` を使用して、サーバーの応答を待たずにUIを更新できます

---

## リアルタイム更新が必要な場合

リアルタイムでデータの更新が必要な場合は、Firebase Listenerを使用できます：

```tsx
// lib/hooks/useBlogContentsRealtime.ts を使用
const { data, loading, error } = useBlogContentsRealtime();
```

### 使い分け

| 要件 | 推奨フック |
|------|-----------|
| 通常のデータ表示 | `useBlogContents` (SWR) |
| リアルタイム更新が必要 | `useBlogContentsRealtime` (Firebase Listener) |

---

## コードの比較

### Before (useEffect)

```tsx
// 手動で状態管理
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  // 手動でフェッチ処理
  // 手動でエラーハンドリング
  // 手動でローディング状態管理
}, []);

// リフレッシュ機能なし
// キャッシングなし
// 自動再検証なし
```

### After (SWR)

```tsx
// 1行で全て完結
const { data, error, isLoading, mutate } = useBlogContents();

// 自動キャッシング ✅
// 自動再検証 ✅
// エラーリトライ ✅
// リフレッシュ機能 ✅ (mutate)
```

---

## まとめ

useEffectでのデータフェッチングは、Next.js App Routerでは推奨されていません。代わりに：

1. **Server Components**: 可能な限り使用（認証不要の場合）
2. **SWR**: Client Componentsでのデータフェッチング（推奨）
3. **Firebase Listener**: リアルタイム更新が必要な場合

これらのツールは、キャッシング、再検証、エラーハンドリングを自動的に処理し、よりロバストなアプリケーションを構築できます。

詳細は `docs/DATA_FETCHING_PATTERNS.md` を参照してください。
