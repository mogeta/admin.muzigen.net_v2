'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { blogService } from '@/lib/services/blogService';
import { BlogItem } from '@/lib/types/blog';
import MarkdownPreview from '@/components/blog/MarkdownPreview';
import 'easymde/dist/easymde.min.css';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
});

function BlogEditorContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blogItem, setBlogItem] = useState<BlogItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [publish, setPublish] = useState(false);
  const [ogpImage, setOgpImage] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchBlogItem = async () => {
      try {
        setLoading(true);
        const item = await blogService.getBlogContentById(id);
        if (item) {
          setBlogItem(item);
          setTitle(item.title);
          setDescription(item.description);
          setTag(item.tag || '');
          setPublish(item.publish);
          setOgpImage(item.ogp_image || '');
          setContent(item.content || '');
        } else {
          alert('Blog post not found');
          router.push('/blog');
        }
      } catch (error) {
        console.error('Error fetching blog item:', error);
        alert('Error loading blog post');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlogItem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    if (!title.trim() || !description.trim() || !content.trim()) {
      alert('Title, description, and content are required');
      return;
    }

    try {
      setSaving(true);

      // Build update data, excluding undefined values
      const updateData: Partial<BlogItem> = {
        title: title.trim(),
        description: description.trim(),
        publish,
        content: content.trim(),
      };

      // Only add optional fields if they have values
      if (tag.trim()) {
        updateData.tag = tag.trim();
      }
      if (ogpImage.trim()) {
        updateData.ogp_image = ogpImage.trim();
      }

      await blogService.updateBlogContent(id, updateData);
      alert('Blog post updated successfully!');
      router.push('/blog');
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Error saving blog post');
    } finally {
      setSaving(false);
    }
  };

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

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!blogItem) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Blog post not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/blog')}
                className="px-4 py-2 text-sm bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                ← Back to List
              </button>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Edit Blog Post
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  showPreview
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'
                }`}
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                Metadata
              </h2>
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter blog post title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter blog post description"
                  />
                </div>

                {/* Tag */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Tag
                  </label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Tutorial, News"
                  />
                </div>

                {/* OGP Image */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    OGP Image URL
                  </label>
                  <input
                    type="text"
                    value={ogpImage}
                    onChange={(e) => setOgpImage(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Publish */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="publish"
                    checked={publish}
                    onChange={(e) => setPublish(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-zinc-100 border-zinc-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600"
                  />
                  <label
                    htmlFor="publish"
                    className="ml-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Publish this post
                  </label>
                </div>
              </div>
            </div>

            {/* Markdown Editor */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                Content *
              </h2>
              <SimpleMDE value={content} onChange={setContent} options={editorOptions} />
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                  Preview
                </h2>
                {ogpImage && (
                  <div className="mb-4">
                    <img
                      src={ogpImage}
                      alt={title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
                <h3 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">
                  {title || 'Untitled'}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  {description || 'No description'}
                </p>
                {tag && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mb-4">
                    {tag}
                  </span>
                )}
                <div className="mt-6">
                  <MarkdownPreview content={content || '*No content yet*'} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function BlogEditor() {
  return (
    <AuthGuard>
      <BlogEditorContent />
    </AuthGuard>
  );
}
