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

// Ensure Fetch API globals exist (Node 20 via undici)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { fetch, Headers, Request, Response } = require('undici');
  // @ts-ignore
  if (!(global as any).fetch) (global as any).fetch = fetch;
  // @ts-ignore
  if (!(global as any).Headers) (global as any).Headers = Headers;
  // @ts-ignore
  if (!(global as any).Request) (global as any).Request = Request;
  // @ts-ignore
  if (!(global as any).Response) (global as any).Response = Response;
} catch {}


