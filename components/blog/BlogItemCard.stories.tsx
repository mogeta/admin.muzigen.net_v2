import type { Meta, StoryObj } from '@storybook/react';
import { Timestamp } from 'firebase/firestore';
import BlogItemCard from './BlogItemCard';
import { BlogItem } from '@/lib/types/blog';

// Mock Timestamp for Storybook
const mockTimestamp = (date: Date): Timestamp => {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
    toDate: () => date,
    toMillis: () => date.getTime(),
    isEqual: () => false,
    valueOf: () => date.getTime().toString(),
  } as Timestamp;
};

const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

const mockBlogItem: BlogItem = {
  id: '1',
  title: 'Getting Started with Next.js 16',
  description: 'Learn how to build modern web applications with the latest version of Next.js. This comprehensive guide covers all the new features and improvements.',
  publish: true,
  tag: 'Tutorial',
  ogp_image: 'https://picsum.photos/seed/nextjs/800/400',
  content_url: 'https://example.com/blog/nextjs-guide',
  markdown_url: 'https://example.com/blog/nextjs-guide.md',
  created_date: mockTimestamp(yesterday),
  update_date: mockTimestamp(now),
};

const meta = {
  title: 'Blog/BlogItemCard',
  component: BlogItemCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BlogItemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Published: Story = {
  args: {
    item: mockBlogItem,
  },
};

export const Draft: Story = {
  args: {
    item: {
      ...mockBlogItem,
      publish: false,
    },
  },
};

export const NoImage: Story = {
  args: {
    item: {
      ...mockBlogItem,
      ogp_image: undefined,
    },
  },
};

export const NoTag: Story = {
  args: {
    item: {
      ...mockBlogItem,
      tag: undefined,
    },
  },
};

export const MinimalInfo: Story = {
  args: {
    item: {
      id: '2',
      title: 'Simple Blog Post',
      description: 'A minimal blog post with just the basic information.',
      publish: false,
      created_date: mockTimestamp(now),
      update_date: mockTimestamp(now),
    },
  },
};

export const LongContent: Story = {
  args: {
    item: {
      ...mockBlogItem,
      title: 'This is a Very Long Title That Should Be Truncated to Two Lines Maximum',
      description: 'This is a very long description that should demonstrate how the component handles text overflow. It should be truncated to three lines maximum to maintain a consistent card height across the grid. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
  },
};
