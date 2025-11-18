import type { Meta, StoryObj } from '@storybook/react';
import LoadingState from './LoadingState';

const meta = {
  title: 'Blog/LoadingState',
  component: LoadingState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
