import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorState from './ErrorState'

describe('ErrorState', () => {
  it('renders the error state heading', () => {
    const mockError = new Error('Test error')
    const mockRetry = vi.fn()

    render(<ErrorState error={mockError} onRetry={mockRetry} />)

    expect(screen.getByText('Failed to load blog contents')).toBeInTheDocument()
  })

  it('renders the error message', () => {
    const mockError = new Error('Test error message')
    const mockRetry = vi.fn()

    render(<ErrorState error={mockError} onRetry={mockRetry} />)

    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('renders default error message when error.message is empty', () => {
    const mockError = new Error('')
    const mockRetry = vi.fn()

    render(<ErrorState error={mockError} onRetry={mockRetry} />)

    expect(screen.getByText('An error occurred while fetching data.')).toBeInTheDocument()
  })

  it('renders retry button', () => {
    const mockError = new Error('Test error')
    const mockRetry = vi.fn()

    render(<ErrorState error={mockError} onRetry={mockRetry} />)

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup()
    const mockError = new Error('Test error')
    const mockRetry = vi.fn()

    render(<ErrorState error={mockError} onRetry={mockRetry} />)

    const retryButton = screen.getByRole('button', { name: 'Retry' })
    await user.click(retryButton)

    expect(mockRetry).toHaveBeenCalledTimes(1)
  })
})
