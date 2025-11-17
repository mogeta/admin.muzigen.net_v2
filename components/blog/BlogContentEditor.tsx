'use client';

import { useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'easymde/dist/easymde.min.css';
import ImageUploader from './ImageUploader';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
});

interface BlogContentEditorProps {
  content: string;
  onContentChange: (value: string) => void;
}

export default function BlogContentEditor({
  content,
  onContentChange,
}: BlogContentEditorProps) {
  // SimpleMDEインスタンスを保持するref
  const simpleMdeInstanceRef = useRef<any>(null);

  const editorOptions = useMemo(
    () => ({
      spellChecker: false,
      placeholder: 'Write your markdown content here...',
      status: false,
      toolbar: [
        'bold',
        'italic',
        'heading',
        '|',
        'quote',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'image',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
        '|',
        'guide',
      ] as const,
    }),
    []
  );

  // SimpleMDEインスタンスを取得するコールバック
  const handleGetMdeInstance = useCallback((instance: any) => {
    simpleMdeInstanceRef.current = instance;
  }, []);

  // 画像がアップロードされたときの処理
  const handleImageUploaded = useCallback((imageUrl: string) => {
    if (simpleMdeInstanceRef.current && simpleMdeInstanceRef.current.codemirror) {
      const cm = simpleMdeInstanceRef.current.codemirror;
      const doc = cm.getDoc();
      const cursor = doc.getCursor();

      // カーソル位置に画像マークダウンを挿入
      const imageMarkdown = `![画像の説明](${imageUrl})`;
      doc.replaceRange(imageMarkdown, cursor);

      // カーソルを画像マークダウンの後に移動
      const newCursor = {
        line: cursor.line,
        ch: cursor.ch + imageMarkdown.length,
      };
      doc.setCursor(newCursor);

      // エディターにフォーカス
      cm.focus();
    }
  }, []);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
      <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
        Content *
      </h2>

      {/* 画像アップローダー */}
      <ImageUploader onImageUploaded={handleImageUploaded} />

      {/* マークダウンエディター */}
      <SimpleMDE
        value={content}
        onChange={onContentChange}
        options={editorOptions}
        getMdeInstance={handleGetMdeInstance}
      />
    </div>
  );
}
