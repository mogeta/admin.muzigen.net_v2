import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import GalleryEditor from './GalleryEditor';
import MarkdownPreview from './MarkdownPreview';

vi.mock('@/lib/firebase', () => ({ auth: { currentUser: { getIdToken: async () => 'test-token' } } }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const image = { src: 'https://example.com/full.webp', thumbnail: 'https://example.com/thumb.webp', alt: '海' };
const block = '```gallery\n' + JSON.stringify({ version: 1, images: [image] }) + '\n```';

it('keeps successful uploads when one fails, retries it and inserts the edited order', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, url: 'https://example.com/a.webp', thumbnailUrl: 'https://example.com/a-thumb.webp' }) })
    .mockResolvedValueOnce({ ok: false, json: async () => ({ error: '通信エラー' }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, url: 'https://example.com/b.webp', thumbnailUrl: 'https://example.com/b-thumb.webp' }) });
  vi.stubGlobal('fetch', fetchMock);
  const insert = vi.fn();
  const { container } = render(<GalleryEditor content="" onContentChange={vi.fn()} onInsert={insert} />);
  fireEvent.change(container.querySelector('input[type=file]')!, { target: { files: [new File(['a'], 'a.jpg', { type: 'image/jpeg' }), new File(['b'], 'b.jpg', { type: 'image/jpeg' })] } });
  await screen.findByText('通信エラー');
  await waitFor(() => expect(screen.getByText('再試行')).toBeEnabled());
  expect(screen.getByText('本文にギャラリーを挿入')).toBeDisabled();
  fireEvent.click(screen.getByText('再試行'));
  await waitFor(() => expect(screen.getByText('本文にギャラリーを挿入')).toBeEnabled());
  fireEvent.change(screen.getByLabelText('写真 2 の説明'), { target: { value: '夕日' } });
  fireEvent.click(screen.getByLabelText('写真 2 を前へ'));
  fireEvent.click(screen.getByText('本文にギャラリーを挿入'));
  const markdown = insert.mock.calls[0][0];
  const data = JSON.parse(markdown.match(/```gallery\n([\s\S]+)\n```/)[1]);
  expect(data.images.map((img: typeof image) => img.src)).toEqual(['https://example.com/b.webp', 'https://example.com/a.webp']);
  expect(data.images[0].alt).toBe('夕日');
  expect(fetchMock).toHaveBeenCalledTimes(3);
});

it('updates only the selected gallery even when two blocks are identical', () => {
  const update = vi.fn();
  render(<GalleryEditor content={block + '\n\n' + block} onContentChange={update} onInsert={vi.fn()} />);
  fireEvent.click(screen.getByText('ギャラリー 2 を編集'));
  fireEvent.change(screen.getByLabelText('写真 1 の説明'), { target: { value: '変更後' } });
  fireEvent.click(screen.getByText('本文のギャラリーを更新'));
  expect(update.mock.calls[0][0]).toMatch(new RegExp('^' + block.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  expect(update.mock.calls[0][0]).toContain('変更後');
});

it('renders gallery markup through the real sanitized preview pipeline', () => {
  const { container } = render(<MarkdownPreview content={'通常の記事\n\n' + block} />);
  expect(container.querySelectorAll('[data-gallery-image]')).toHaveLength(1);
  expect(screen.getByAltText('海')).toHaveAttribute('src', image.thumbnail);
  expect(screen.getByRole('link', { name: '海' })).toHaveAttribute('href', image.src);
  expect(screen.getByText('通常の記事')).toBeInTheDocument();
});
