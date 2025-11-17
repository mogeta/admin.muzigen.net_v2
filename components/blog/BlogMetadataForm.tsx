interface BlogMetadataFormProps {
  title: string;
  description: string;
  tag: string;
  ogpImage: string;
  publish: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onOgpImageChange: (value: string) => void;
  onPublishChange: (value: boolean) => void;
}

export default function BlogMetadataForm({
  title,
  description,
  tag,
  ogpImage,
  publish,
  onTitleChange,
  onDescriptionChange,
  onTagChange,
  onOgpImageChange,
  onPublishChange,
}: BlogMetadataFormProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
      <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
        Metadata
      </h2>
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter blog post title"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter blog post description"
          />
        </div>

        {/* Tag */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Tag
          </label>
          <input
            type="text"
            value={tag}
            onChange={(e) => onTagChange(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Tutorial, News"
          />
        </div>

        {/* OGP Image */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            OGP Image URL
          </label>
          <input
            type="text"
            value={ogpImage}
            onChange={(e) => onOgpImageChange(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Publish */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="publish"
            checked={publish}
            onChange={(e) => onPublishChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-zinc-100 border-zinc-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600"
          />
          <label
            htmlFor="publish"
            className="ml-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Publish this post
          </label>
        </div>
      </div>
    </div>
  );
}
