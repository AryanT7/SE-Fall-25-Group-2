import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock react-router-dom

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>()
    const React = await import('react')
  
    return {
      ...actual, // keep MemoryRouter, BrowserRouter, etc.
      Link: ({ children, to, ...props }: any) =>
        React.createElement('a', { href: to, ...props }, children),
      useNavigate: () => vi.fn(),
      useLocation: () => ({ pathname: '/' }),
    }
  })


// Mock sonner toast

vi.mock('sonner', async (importOriginal) => {
    const actual = await importOriginal<typeof import('sonner')>()
    return {
      ...actual,
      toast: {
        success: vi.fn(),
        error: vi.fn(),
      },
    }
  })



// Mock CSS modules
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
