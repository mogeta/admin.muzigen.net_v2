'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'easymde/dist/easymde.min.css';

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
      ],
    }),
    []
  );

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
      <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
        Content *
      </h2>
      <SimpleMDE value={content} onChange={onContentChange} options={editorOptions} />
    </div>
  );
}
