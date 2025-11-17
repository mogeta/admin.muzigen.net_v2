import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { blogService } from '@/lib/services/blogService';
import { BlogItem } from '@/lib/types/blog';

export interface BlogFormData {
  title: string;
  description: string;
  tag: string;
  publish: boolean;
  ogpImage: string;
  content: string;
}

export function useBlogEditor(id: string) {
  const router = useRouter();
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

  const formData: BlogFormData = {
    title,
    description,
    tag,
    publish,
    ogpImage,
    content,
  };

  const formHandlers = {
    setTitle,
    setDescription,
    setTag,
    setPublish,
    setOgpImage,
    setContent,
  };

  return {
    loading,
    saving,
    blogItem,
    showPreview,
    setShowPreview,
    formData,
    formHandlers,
    handleSave,
    router,
  };
}
