import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
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
      // Explicitly type the array as QueryConstraint[] to avoid type inference issues
      const queryConstraints: QueryConstraint[] = [
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

  /**
   * Fetch a single blog content by ID
   */
  async getBlogContentById(id: string): Promise<BlogItem | null> {
    try {
      const docRef = doc(firestore, 'blog_contents', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as BlogItem;
      } else {
        console.error('Blog content not found:', id);
        return null;
      }
    } catch (error) {
      console.error('Error fetching blog content:', error);
      throw error;
    }
  }

  /**
   * Create a new blog content
   */
  async createBlogContent(data: Omit<BlogItem, 'id' | 'created_date' | 'update_date'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const c = collection(firestore, 'blog_contents');

      // Set required fields with defaults
      const newBlogData = {
        title: data.title || '',
        description: data.description || '',
        publish: data.publish ?? false,
        content: data.content || '',
        created_date: now,
        update_date: now,
        // Only include optional fields if they have defined values
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.ogp_image !== undefined && { ogp_image: data.ogp_image }),
        ...(data.content_url !== undefined && { content_url: data.content_url }),
        ...(data.markdown_url !== undefined && { markdown_url: data.markdown_url }),
        ...(data.elements !== undefined && { elements: data.elements }),
      };

      const docRef = await addDoc(c, newBlogData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating blog content:', error);
      throw error;
    }
  }

  /**
   * Update a blog content
   */
  async updateBlogContent(id: string, data: Partial<BlogItem>): Promise<void> {
    try {
      const docRef = doc(firestore, 'blog_contents', id);

      // Always update the update_date
      const updateData = {
        ...data,
        update_date: Timestamp.now()
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating blog content:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const blogService = new BlogService();
