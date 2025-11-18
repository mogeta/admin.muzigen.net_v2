# admin.muzigen.net v2

muzigen.net の管理パネル（バージョン2）です。ブログ記事の作成・編集・管理などの管理機能を提供します。

## 主な機能

- **認証システム**: Firebase Authentication による Google サインイン
- **ブログ管理**: Markdown エディターを使用した記事の作成・編集・削除
- **ダッシュボード**: 管理画面のメインダッシュボード
- **画像アップロード**: 記事内で使用する画像のアップロード機能
- **設定管理**: アプリケーション設定の管理

## 技術スタック

- **フレームワーク**: Next.js 16.0.0 (App Router)
- **言語**: TypeScript
- **UI**: React 19.2.0
- **スタイリング**: Tailwind CSS 4
- **認証**: Firebase Authentication
- **データベース**: Firebase (Firestore)
- **ストレージ**: Firebase Storage
- **Markdown エディター**: SimpleMDE / EasyMDE
- **Markdown レンダリング**: react-markdown + rehype plugins
- **テスト**: Vitest + Testing Library
- **データフェッチング**: SWR

## 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# Firebase クライアント設定
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK（サーバーサイド）
# サービスアカウントのJSONキーを単一の環境変数として設定します
FIREBASE_SERVICE_ACCOUNT_KEY='<your-service-account-key-json>'
```

## セットアップ

1. リポジトリをクローン:

```bash
git clone <repository-url>
cd <repository-name>
```

2. 依存関係をインストール:

```bash
npm install
```

3. 環境変数を設定（上記参照）

## 開発

開発サーバーを起動:

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## テスト

```bash
# テストを実行
npm test

# テストを1回だけ実行
npm run test:run

# カバレッジを表示
npm run test:coverage

# テスト UI を起動
npm run test:ui
```

## ビルド

```bash
npm run build
```

## 本番環境での起動

```bash
npm start
```

## プロジェクト構造

```
admin.muzigen.net_v2/
├── app/                    # Next.js App Router ページ
│   ├── api/               # API ルート
│   ├── blog/              # ブログ管理ページ
│   ├── dashboard/         # ダッシュボード
│   ├── settings/          # 設定ページ
│   └── signin/            # サインインページ
├── components/            # React コンポーネント
│   ├── blog/             # ブログ関連コンポーネント
│   └── AuthGuard.tsx     # 認証ガード
├── lib/                   # ユーティリティとライブラリ
│   ├── firebase.ts       # Firebase クライアント設定
│   ├── firebase-admin.ts # Firebase Admin 設定
│   ├── AuthContext.tsx   # 認証コンテキスト
│   ├── hooks/            # カスタムフック
│   ├── services/         # ビジネスロジック
│   └── types/            # TypeScript 型定義
├── docs/                  # ドキュメント
└── public/                # 静的ファイル
```

## コーディング規約

- TypeScript の厳格モードを使用
- ESLint でコードの品質を保証
- Tailwind CSS でスタイリング
- コンポーネントはできるだけ小さく、再利用可能に設計

## ドキュメント

より詳細な情報は `docs/` ディレクトリを参照してください：

- [AUTH_PATTERNS.md](./docs/AUTH_PATTERNS.md) - 認証パターンとベストプラクティス
- [BLOG_PAGE_IMPROVEMENTS.md](./docs/BLOG_PAGE_IMPROVEMENTS.md) - ブログページの改善履歴
- [DATA_FETCHING_PATTERNS.md](./docs/DATA_FETCHING_PATTERNS.md) - データフェッチングパターン

## ライセンス

Private
