import type { Meta, StoryObj } from '@storybook/react';
import ErrorState from './ErrorState';

const meta = {
  title: 'Blog/ErrorState',
  component: ErrorState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    error: new Error('Failed to fetch data'),
    onRetry: () => console.log('Retry clicked'),
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NetworkError: Story = {
  args: {
    error: new Error('Network connection failed'),
  },
};

export const TimeoutError: Story = {
  args: {
    error: new Error('Request timeout'),
  },
};
