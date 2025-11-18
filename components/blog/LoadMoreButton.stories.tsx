import type { Meta, StoryObj } from '@storybook/react';
import LoadMoreButton from './LoadMoreButton';

const meta = {
  title: 'Blog/LoadMoreButton',
  component: LoadMoreButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onLoadMore: () => console.log('Load more clicked'),
  },
} satisfies Meta<typeof LoadMoreButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isLoadingMore: false,
  },
};

export const Loading: Story = {
  args: {
    isLoadingMore: true,
  },
};
