import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { blogService } from '@/lib/services/blogService';
import { BlogItem } from '@/lib/types/blog';

export interface BlogFormData {
  title: string;
  description: string;
  tags: string[];
  publish: boolean;
  ogpImage: string;
  content: string;
}

export function useBlogCreator() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Form state - all start empty for new blog
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [publish, setPublish] = useState(false);
  const [ogpImage, setOgpImage] = useState('');
  const [content, setContent] = useState('');

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !content.trim()) {
      alert('Title, description, and content are required');
      return;
    }

    try {
      setSaving(true);

      // Build create data
      const createData: Omit<BlogItem, 'id' | 'created_date' | 'update_date'> = {
        title: title.trim(),
        description: description.trim(),
        publish,
        content: content.trim(),
        tags: tags.length > 0 ? tags : undefined,
        ogp_image: ogpImage.trim() || undefined,
      };

      const newId = await blogService.createBlogContent(createData);
      alert('Blog post created successfully!');
      router.push('/blog');
    } catch (error) {
      console.error('Error creating blog post:', error);
      alert('Error creating blog post');
    } finally {
      setSaving(false);
    }
  };

  const formData: BlogFormData = {
    title,
    description,
    tags,
    publish,
    ogpImage,
    content,
  };

  const formHandlers = {
    setTitle,
    setDescription,
    setTags,
    setPublish,
    setOgpImage,
    setContent,
  };

  return {
    saving,
    showPreview,
    setShowPreview,
    formData,
    formHandlers,
    handleCreate,
    router,
  };
}
