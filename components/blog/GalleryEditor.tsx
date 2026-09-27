'use client';

import { useRef, useState } from 'react';
import { auth } from '@/lib/firebase';
import { parseGallery, type GalleryImage } from '@/lib/gallery/gallery.mjs';

type Entry = { id: string; file?: File; image?: GalleryImage; alt: string; error?: string };
interface Props {
  onInsert: (markdown: string) => void;
  content: string;
  onContentChange: (value: string) => void;
}

export default function GalleryEditor({ onInsert, content, onContentChange }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [editing, setEditing] = useState<{ block: string; index: number } | null>(null);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const blocks = Array.from(content.matchAll(/^```gallery\r?\n([\s\S]*?)^```[ \t]*$/gm));
  const update = (id: string, patch: Partial<Entry>) => setEntries((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));

  async function upload(items: Entry[]) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      for (const [index, item] of items.entries()) {
        setProgress(`${index + 1} / ${items.length} 枚をアップロード中`);
        update(item.id, { error: undefined });
        try {
          const file = item.file!;
          if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(file.type)) throw new Error('JPEG・PNG・GIF・WebP・SVGを選択してください');
          if (file.size > 10 * 1024 * 1024) throw new Error('1枚10MB以下にしてください');
          const user = auth.currentUser;
          if (!user) throw new Error('ログインが必要です');
          const form = new FormData();
          form.append('file', file);
          form.append('gallery', 'true');
          const response = await fetch('/api/upload-image', { method: 'POST', headers: { Authorization: `Bearer ${await user.getIdToken()}` }, body: form });
          const data = await response.json();
          if (!response.ok || !data.success || !data.url || !data.thumbnailUrl) throw new Error(data.error || 'アップロードに失敗しました');
          update(item.id, { image: { src: data.url, thumbnail: data.thumbnailUrl, alt: item.alt }, file: undefined });
        } catch (err) {
          update(item.id, { error: err instanceof Error ? err.message : 'アップロードに失敗しました' });
        }
      }
    } finally {
      lock.current = false;
      setBusy(false);
      setProgress('');
    }
  }

  function addFiles(files: File[]) {
    if (lock.current || !files.length) return;
    if (entries.length + files.length > 200) { setError('1つのギャラリーは200枚までです'); return; }
    setError('');
    const added = files.map((file) => ({ id: crypto.randomUUID(), file, alt: '' }));
    setEntries((items) => [...items, ...added]);
    void upload(added);
  }

  function move(index: number, direction: number) {
    setEntries((items) => {
      const next = [...items];
      [next[index], next[index + direction]] = [next[index + direction], next[index]];
      return next;
    });
  }

  function insert() {
    const images = entries.map((item) => ({ ...item.image!, alt: item.alt }));
    const markdown = '```gallery\n' + JSON.stringify({ version: 1, images }, null, 2) + '\n```';
    if (editing !== null) {
      if (content.slice(editing.index, editing.index + editing.block.length) !== editing.block) { setError('本文のギャラリーが変更されています。編集対象を読み直してください'); return; }
      onContentChange(content.slice(0, editing.index) + markdown + content.slice(editing.index + editing.block.length));
    } else {
      onInsert('\n\n' + markdown + '\n\n');
    }
    setEntries([]);
    setEditing(null);
    setError('');
  }

  return (
    <details className="mb-4 rounded-lg border border-zinc-300 p-4" onToggle={() => setError('')}>
      <summary className="cursor-pointer font-semibold">画像ギャラリーを追加・編集</summary>
      <p className="my-3 text-sm">画像をまとめて追加し、並び順と説明を整えて本文に挿入します（最大200枚、1枚10MB）。</p>
      <fieldset disabled={busy} className="space-y-3 disabled:opacity-60">
        {blocks.length > 0 && <div className="flex flex-wrap gap-2">{blocks.map((block, index) => (
          <button type="button" key={index} disabled={entries.length > 0} className="rounded border px-3 py-2" onClick={() => {
            const data = parseGallery(block[1]);
            if (!data) { setError('このギャラリーの形式は読み込めません'); return; }
            setEntries(data.images.map((image) => ({ id: crypto.randomUUID(), image, alt: image.alt })));
            setEditing({ block: block[0], index: block.index! });
          }}>ギャラリー {index + 1} を編集</button>
        ))}</div>}
        <div className="rounded border-2 border-dashed p-5 text-center" onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
          event.preventDefault(); addFiles(Array.from(event.dataTransfer.files));
        }}>
          <button type="button" className="rounded border px-4 py-2" onClick={() => input.current?.click()}>画像をまとめて選択</button>
          <p className="mt-2 text-sm">ここにドラッグ＆ドロップもできます</p>
          <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml" className="hidden" onChange={(event) => {
            addFiles(Array.from(event.target.files || [])); event.target.value = '';
          }} />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {entries.map((item, index) => <div key={item.id} className="min-w-0 rounded border p-2">
            {item.image ? <img src={item.image.thumbnail} alt={item.alt} className="aspect-square w-full object-cover" /> : <p className="break-all text-sm">{item.file?.name}</p>}
            <label className="block text-sm">写真 {index + 1} の説明<input value={item.alt} onChange={(event) => update(item.id, { alt: event.target.value })} className="mt-1 w-full rounded border p-1" /></label>
            {item.error && <p role="alert" className="text-sm text-red-600">{item.error}</p>}
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" disabled={index === 0} aria-label={`写真 ${index + 1} を前へ`} onClick={() => move(index, -1)} className="rounded border px-2 disabled:opacity-30">←</button>
              <button type="button" disabled={index === entries.length - 1} aria-label={`写真 ${index + 1} を後ろへ`} onClick={() => move(index, 1)} className="rounded border px-2 disabled:opacity-30">→</button>
              <button type="button" onClick={() => setEntries((items) => items.filter((entry) => entry.id !== item.id))} className="rounded border px-2">除外</button>
              {item.error && <button type="button" onClick={() => void upload([item])} className="rounded border px-2">再試行</button>}
            </div>
          </div>)}
        </div>
        {entries.length > 0 && <div className="flex gap-3">
          <button type="button" disabled={entries.some((item) => !item.image)} onClick={insert} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-40">{editing ? '本文のギャラリーを更新' : '本文にギャラリーを挿入'}</button>
          <button type="button" className="rounded border px-3 py-2" onClick={() => { setEntries([]); setEditing(null); setError(''); }}>編集をクリア</button>
        </div>}
      </fieldset>
      <p role="status" className="mt-2 text-sm">{progress}</p>
      {error && <p role="alert" className="text-red-600">{error}</p>}
    </details>
  );
}
