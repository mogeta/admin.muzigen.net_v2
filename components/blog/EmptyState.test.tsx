import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EmptyState from './EmptyState'

describe('EmptyState', () => {
  it('renders the empty state message', () => {
    render(<EmptyState />)

    expect(screen.getByText('No blog posts found')).toBeInTheDocument()
    expect(screen.getByText('Get started by creating your first blog post.')).toBeInTheDocument()
  })

  it('renders an icon', () => {
    const { container } = render(<EmptyState />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
