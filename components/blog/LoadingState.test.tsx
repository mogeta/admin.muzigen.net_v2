import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import LoadingState from './LoadingState'

describe('LoadingState', () => {
  it('renders without crashing', () => {
    const { container } = render(<LoadingState />)
    expect(container).toBeInTheDocument()
  })
})
