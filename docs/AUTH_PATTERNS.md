# Authentication Patterns

このプロジェクトでは、Next.js App Routerのベストプラクティスに基づいた2つの認証パターンを提供しています。

## パターン1: AuthGuard コンポーネント（推奨）

`AuthGuard` コンポーネントは、保護されたページをラップして認証をチェックします。

### 使い方

```tsx
'use client';

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/lib/AuthContext';

function ProtectedContent() {
  const { user, signOut } = useAuth();

  return (
    <div>
      <h1>Welcome {user?.displayName}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <ProtectedContent />
    </AuthGuard>
  );
}
```

### メリット

- **宣言的**: JSX内でラップするだけ
- **再利用可能**: どのページでも同じパターンで使える
- **ローディング処理**: デフォルトのローディングUIを提供
- **カスタマイズ可能**: カスタムローディングUIやリダイレクト先を指定可能

### オプション

```tsx
<AuthGuard
  redirectTo="/custom-signin"  // カスタムリダイレクト先
  fallback={<CustomLoader />}  // カスタムローディングUI
>
  <YourContent />
</AuthGuard>
```

### 実装例

- `/app/dashboard/page.tsx`

---

## パターン2: useRequireAuth フック

`useRequireAuth` フックは、コンポーネント内で認証をチェックします。

### 使い方

```tsx
'use client';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';

export default function ProtectedPage() {
  const { user, loading, signOut } = useRequireAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // リダイレクト中
  }

  return (
    <div>
      <h1>Welcome {user.displayName}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### メリット

- **シンプル**: フックを呼ぶだけ
- **フレキシブル**: ローディング状態を完全にコントロール
- **型安全**: ユーザー情報に直接アクセス

### オプション

```tsx
// カスタムリダイレクト先を指定
const { user, loading } = useRequireAuth('/custom-signin');
```

### 実装例

- `/app/settings/page.tsx`

---

## どちらを使うべきか？

### AuthGuard コンポーネントを使う場合

- ✅ シンプルな保護ページ
- ✅ 一貫したローディングUIを使いたい
- ✅ 宣言的なコードを好む
- ✅ レイアウトレベルでの保護

### useRequireAuth フックを使う場合

- ✅ ローディング状態のカスタマイズが必要
- ✅ ユーザー情報に基づいた条件分岐が多い
- ✅ より細かい制御が必要

---

## レイアウトレベルでの認証保護

複数のページをまとめて保護する場合は、レイアウトで `AuthGuard` を使用できます：

```tsx
// app/dashboard/layout.tsx
'use client';

import AuthGuard from '@/components/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="dashboard-layout">
        {children}
      </div>
    </AuthGuard>
  );
}
```

この方法により、`/dashboard` 配下の全てのページが自動的に保護されます。

---

## 認証コンテキスト

両パターンとも、`AuthContext` を使用してユーザー情報を管理しています。

```tsx
import { useAuth } from '@/lib/AuthContext';

const { user, loading, signOut } = useAuth();
```

### 提供される値

- `user`: Firebase User オブジェクト（未認証の場合は `null`）
- `loading`: 認証状態を確認中かどうか
- `signOut`: サインアウト関数

---

## ファイル構成

```
lib/
  ├── AuthContext.tsx          # 認証コンテキスト
  ├── firebase.ts              # Firebase設定
  └── hooks/
      └── useRequireAuth.ts    # 認証フック

components/
  └── AuthGuard.tsx            # 認証ガードコンポーネント

app/
  ├── signin/
  │   └── page.tsx            # サインインページ
  ├── dashboard/
  │   └── page.tsx            # AuthGuardを使用した例
  └── settings/
      └── page.tsx            # useRequireAuthを使用した例
```
