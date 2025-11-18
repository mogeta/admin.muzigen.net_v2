import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import LoadingState from './LoadingState'

describe('LoadingState', () => {
  it('renders the loading spinner', () => {
    const { container } = render(<LoadingState />)

    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with correct styling classes', () => {
    const { container } = render(<LoadingState />)

    const wrapper = container.querySelector('.flex.justify-center.items-center')
    expect(wrapper).toBeInTheDocument()

    const spinner = container.querySelector('.rounded-full.h-12.w-12.border-b-2')
    expect(spinner).toBeInTheDocument()
  })
})
