import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

// Mock Firebase modules
vi.mock('firebase/app', async () => {
  const actual = await vi.importActual('__mocks__/firebase/app')
  return actual
})

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('__mocks__/firebase/auth')
  return actual
})

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('__mocks__/firebase/firestore')
  return actual
})

vi.mock('firebase/storage', async () => {
  const actual = await vi.importActual('__mocks__/firebase/storage')
  return actual
})
