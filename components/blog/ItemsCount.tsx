interface ItemsCountProps {
  count: number;
  hasMore: boolean;
}

export default function ItemsCount({ count, hasMore }: ItemsCountProps) {
  return (
    <div className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
      Showing {count} blog post{count !== 1 ? 's' : ''}
      {hasMore && ' (more available)'}
    </div>
  );
}
