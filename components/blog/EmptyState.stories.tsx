import type { Meta, StoryObj } from '@storybook/react';
import EmptyState from './EmptyState';

const meta = {
  title: 'Blog/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
