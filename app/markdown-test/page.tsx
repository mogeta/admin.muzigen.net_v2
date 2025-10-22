'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'easymde/dist/easymde.min.css';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
});

export default function MarkdownTestPage() {
  const [value, setValue] = useState('# Hello World\n\nStart typing your markdown here...');

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Markdown Editor Test</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <SimpleMDE
            value={value}
            onChange={setValue}
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Preview (Raw Markdown)</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-auto">
            <code>{value}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
