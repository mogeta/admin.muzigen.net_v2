import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ItemsCount from './ItemsCount'

describe('ItemsCount', () => {
  it('renders singular form for 1 post', () => {
    render(<ItemsCount count={1} hasMore={false} />)

    expect(screen.getByText('Showing 1 blog post')).toBeInTheDocument()
  })

  it('renders plural form for 0 posts', () => {
    render(<ItemsCount count={0} hasMore={false} />)

    expect(screen.getByText('Showing 0 blog posts')).toBeInTheDocument()
  })

  it('renders plural form for multiple posts', () => {
    render(<ItemsCount count={5} hasMore={false} />)

    expect(screen.getByText('Showing 5 blog posts')).toBeInTheDocument()
  })

  it('shows "more available" text when hasMore is true', () => {
    render(<ItemsCount count={10} hasMore={true} />)

    expect(screen.getByText('Showing 10 blog posts (more available)')).toBeInTheDocument()
  })

  it('does not show "more available" text when hasMore is false', () => {
    render(<ItemsCount count={10} hasMore={false} />)

    expect(screen.getByText('Showing 10 blog posts')).toBeInTheDocument()
    expect(screen.queryByText(/more available/)).not.toBeInTheDocument()
  })
})
