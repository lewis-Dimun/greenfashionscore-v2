// Fetch + Request/Response in jsdom
import 'whatwg-fetch';
import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react');
    return React.createElement('img', props);
  }
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
// @ts-expect-error - ResizeObserver polyfill
global.ResizeObserver = (global as any).ResizeObserver || ResizeObserver;

// Ensure Fetch API globals exist (Node 20 via undici)
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { fetch, Headers, Request, Response } = require('undici');
  // @ts-expect-error - Fetch API polyfill
  if (!(global as any).fetch) (global as any).fetch = fetch;
  // @ts-expect-error - Headers polyfill
  if (!(global as any).Headers) (global as any).Headers = Headers;
  // @ts-expect-error - Request polyfill
  if (!(global as any).Request) (global as any).Request = Request;
  // @ts-expect-error - Response polyfill
  if (!(global as any).Response) (global as any).Response = Response;
} catch {}


