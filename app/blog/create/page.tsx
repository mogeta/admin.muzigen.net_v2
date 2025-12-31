'use client';

import { useAuth } from '@/lib/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { useBlogCreator } from '@/lib/hooks/useBlogCreator';
import BlogEditHeader from '@/components/blog/BlogEditHeader';
import BlogMetadataForm from '@/components/blog/BlogMetadataForm';
import BlogContentEditor from '@/components/blog/BlogContentEditor';
import BlogPreviewPanel from '@/components/blog/BlogPreviewPanel';

function BlogCreatorContent() {
  const { user } = useAuth();

  const {
    saving,
    showPreview,
    setShowPreview,
    formData,
    formHandlers,
    handleCreate,
    router,
  } = useBlogCreator();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <BlogEditHeader
        onBack={() => router.push('/blog')}
        onTogglePreview={() => setShowPreview(!showPreview)}
        onSave={handleCreate}
        showPreview={showPreview}
        saving={saving}
        title="Create New Blog Post"
        saveLabel="Create Post"
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

export default function BlogCreator() {
  return (
    <AuthGuard>
      <BlogCreatorContent />
    </AuthGuard>
  );
}
