'use client';

import { useEffect, useRef } from 'react';
import { rehypeGallery, mountGalleries } from '@/lib/gallery/gallery.mjs';
import '@/lib/gallery/gallery.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';

interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => root.current ? mountGalleries(root.current) : undefined, [content]);
  return (
    <div ref={root} className="markdown-preview prose prose-zinc dark:prose-invert max-w-none overflow-auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeGallery, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
