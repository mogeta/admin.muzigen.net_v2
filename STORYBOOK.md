# Storybook Setup

このプロジェクトにStorybookが導入されています。コンポーネントを独立した環境でプレビュー・開発・テストできます。

## 利用可能なコマンド

```bash
# 開発サーバーを起動 (http://localhost:6006)
npm run storybook

# 静的ビルドを生成
npm run build-storybook
```

## 作成済みのストーリー

以下のコンポーネントのストーリーが作成されています：

- `components/blog/EmptyState.stories.tsx` - 空の状態を表示するコンポーネント
- `components/blog/ErrorState.stories.tsx` - エラー状態を表示するコンポーネント (複数のバリエーション)
- `components/blog/LoadingState.stories.tsx` - ローディング状態を表示するコンポーネント
- `components/blog/LoadMoreButton.stories.tsx` - もっと読むボタンコンポーネント (デフォルトとローディング状態)
- `components/blog/BlogItemCard.stories.tsx` - ブログ記事カード (公開/下書き/画像なし/タグなしなど、複数のバリエーション)

## 新しいストーリーの追加

以下のパターンでストーリーファイルを作成してください：

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import YourComponent from './YourComponent';

const meta = {
  title: 'Category/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // props here
  },
};
```

## 技術的な詳細

### フレームワーク

- **Storybook 8.6.14** with **React Vite** framework
- Next.js 16との互換性を確保するため、`@storybook/react-vite`を使用
- Tailwind CSS v4のスタイルが自動的に適用されます

### 設定ファイル

- `.storybook/main.ts` - Storybookのメイン設定
- `.storybook/preview.tsx` - グローバルスタイルとプレビュー設定

### Next.js 16互換性について

現在のStorybookは`@storybook/react-vite`を使用しています。これは、`@storybook/nextjs`フレームワークがNext.js 16とまだ完全に互換性がないためです。

将来的に`@storybook/nextjs`がNext.js 16をサポートした際は、以下の手順で移行できます：

1. `@storybook/react-vite`を`@storybook/nextjs`に置き換え
2. `.storybook/main.ts`のフレームワーク設定を更新
3. Next.jsネイティブの機能（Image、Link等）が自動的にモックされるようになります

## トラブルシューティング

### Linkコンポーネントのエラー

`next/link`を使用しているコンポーネントでエラーが発生する場合は、ストーリーファイル内でモックを作成してください：

```typescript
// Story内でLinkをモック
const decorators = [
  (Story) => {
    // モック実装
    return <Story />;
  },
];
```

### ビルドサイズの警告

一部のチャンクが500KBを超える警告が表示されますが、これは開発時のみの問題です。production buildでは最適化されます。

## 参考リンク

- [Storybook Documentation](https://storybook.js.org/docs)
- [Storybook for React](https://storybook.js.org/docs/react)
- [Writing Stories](https://storybook.js.org/docs/react/writing-stories/introduction)
