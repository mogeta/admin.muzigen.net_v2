import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoadMoreButton from './LoadMoreButton'

describe('LoadMoreButton', () => {
  it('renders the button with "Load More" text when not loading', () => {
    const mockLoadMore = vi.fn()

    render(<LoadMoreButton onLoadMore={mockLoadMore} isLoadingMore={false} />)

    expect(screen.getByRole('button', { name: 'Load More' })).toBeInTheDocument()
  })

  it('renders "Loading..." text when loading', () => {
    const mockLoadMore = vi.fn()

    render(<LoadMoreButton onLoadMore={mockLoadMore} isLoadingMore={true} />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('calls onLoadMore when button is clicked', async () => {
    const user = userEvent.setup()
    const mockLoadMore = vi.fn()

    render(<LoadMoreButton onLoadMore={mockLoadMore} isLoadingMore={false} />)

    const button = screen.getByRole('button', { name: 'Load More' })
    await user.click(button)

    expect(mockLoadMore).toHaveBeenCalledTimes(1)
  })

  it('disables button when loading', () => {
    const mockLoadMore = vi.fn()

    render(<LoadMoreButton onLoadMore={mockLoadMore} isLoadingMore={true} />)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('enables button when not loading', () => {
    const mockLoadMore = vi.fn()

    render(<LoadMoreButton onLoadMore={mockLoadMore} isLoadingMore={false} />)

    const button = screen.getByRole('button', { name: 'Load More' })
    expect(button).not.toBeDisabled()
  })

  it('shows loading spinner when loading', () => {
    const mockLoadMore = vi.fn()

    const { container } = render(<LoadMoreButton onLoadMore={mockLoadMore} isLoadingMore={true} />)

    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
})
