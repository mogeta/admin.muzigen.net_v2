import { collection, getDocs, query, orderBy, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { BlogItem } from '@/lib/types/blog';

export interface PaginatedBlogResult {
  items: BlogItem[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

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
   * Fetch paginated blog contents ordered by update_date (descending)
   */
  async getPaginatedBlogContents(
    pageSize: number,
    lastDocument?: DocumentSnapshot
  ): Promise<PaginatedBlogResult> {
    const items: BlogItem[] = [];

    try {
      const c = collection(firestore, 'blog_contents');
      const queryConstraints = [
        orderBy('update_date', 'desc'),
      ];

      if (lastDocument) {
        queryConstraints.push(startAfter(lastDocument));
      }
      queryConstraints.push(limit(pageSize + 1));
      const q = query(c, ...queryConstraints);

      const snapshot = await getDocs(q);
      const docs = snapshot.docs;

      // Check if there are more items beyond the current page
      const hasMore = docs.length > pageSize;
      const itemsToReturn = hasMore ? docs.slice(0, pageSize) : docs;

      itemsToReturn.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as BlogItem);
      });

      return {
        items,
        lastDoc: itemsToReturn.length > 0 ? itemsToReturn[itemsToReturn.length - 1] : null,
        hasMore
      };
    } catch (error) {
      console.error('Error fetching paginated blog contents:', error);
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
