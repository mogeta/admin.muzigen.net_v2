import { BlogItem } from '@/lib/types/blog';
import BlogItemCard from './BlogItemCard';

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
