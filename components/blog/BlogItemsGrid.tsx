import { Timestamp } from 'firebase/firestore';
import BlogItemCard from './BlogItemCard';

interface BlogItem {
  id: string;
  title: string;
  description: string;
  publish: boolean;
  tag?: string;
  ogp_image?: string;
  content_url?: string;
  markdown_url?: string;
  created_date: Timestamp;
  update_date: Timestamp;
}

interface BlogItemsGridProps {
  items: BlogItem[];
}

export default function BlogItemsGrid({ items }: BlogItemsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <BlogItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
