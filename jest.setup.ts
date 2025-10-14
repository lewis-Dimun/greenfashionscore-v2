// Fetch + Request/Response in jsdom
import 'whatwg-fetch';
import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => require('react').createElement('img', props)
}));

// Mock Next App Router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn()
  }),
  useSearchParams: () => new URLSearchParams('')
}));

// Polyfill ResizeObserver for Recharts
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
global.ResizeObserver = (global as any).ResizeObserver || ResizeObserver;


