'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { useBlogEditor } from '@/lib/hooks/useBlogEditor';
import BlogEditHeader from '@/components/blog/BlogEditHeader';
import BlogMetadataForm from '@/components/blog/BlogMetadataForm';
import BlogContentEditor from '@/components/blog/BlogContentEditor';
import BlogPreviewPanel from '@/components/blog/BlogPreviewPanel';

function BlogEditorContent() {
  const params = useParams();
  const { user } = useAuth();
  const id = params.id as string;

  const {
    loading,
    saving,
    blogItem,
    showPreview,
    setShowPreview,
    formData,
    formHandlers,
    handleSave,
    router,
  } = useBlogEditor(id);

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
      <BlogEditHeader
        onBack={() => router.push('/blog')}
        onTogglePreview={() => setShowPreview(!showPreview)}
        onSave={handleSave}
        showPreview={showPreview}
        saving={saving}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Section */}
          <div className="space-y-6">
            <BlogMetadataForm
              title={formData.title}
              description={formData.description}
              tags={formData.tags}
              ogpImage={formData.ogpImage}
              publish={formData.publish}
              onTitleChange={formHandlers.setTitle}
              onDescriptionChange={formHandlers.setDescription}
              onTagsChange={formHandlers.setTags}
              onOgpImageChange={formHandlers.setOgpImage}
              onPublishChange={formHandlers.setPublish}
            />

            <BlogContentEditor
              content={formData.content}
              onContentChange={formHandlers.setContent}
            />
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="space-y-6">
              <BlogPreviewPanel
                title={formData.title}
                description={formData.description}
                tags={formData.tags}
                ogpImage={formData.ogpImage}
                content={formData.content}
              />
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
