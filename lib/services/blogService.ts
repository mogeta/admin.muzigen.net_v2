import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { BlogItem } from '@/lib/types/blog';

export class BlogService {
  /**
   * Fetch all blog contents ordered by update_date (descending)
   */
  async getBlogContents(): Promise<BlogItem[]> {
    const items: BlogItem[] = [];

    try {
      const c = collection(firestore, 'blog_contents');
      const q = query(c, orderBy('update_date', 'desc'));
      const snapshot = await getDocs(q);

      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as BlogItem);
      });

      return items;
    } catch (error) {
      console.error('Error fetching blog contents:', error);
      throw error;
    }
  }

  /**
   * Fetch only published blog contents ordered by update_date (descending)
   */
  async getPublishedBlogContents(): Promise<BlogItem[]> {
    const items = await this.getBlogContents();
    return items.filter(item => item.publish === true);
  }
}

// Export a singleton instance
export const blogService = new BlogService();
