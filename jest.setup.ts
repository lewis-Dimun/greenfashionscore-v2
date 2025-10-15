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

// Mock Supabase auth
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: '123' } } }, error: null })),
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: '123' } }, error: null })),
      onAuthStateChange: jest.fn(() => ({ 
        data: { subscription: { unsubscribe: jest.fn() } } 
      })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  }))
}));

// Supabase auth helpers are mocked in __mocks__/@supabase/auth-helpers-nextjs.ts

// Mock AuthGuard globally to avoid auth state side-effects
// This will catch all imports of AuthGuard regardless of the path
const mockAuthGuard = () => {
  return function MockAuthGuard({ children }: { children: any }) {
    return children;
  };
};

jest.mock('../components/AuthGuard', mockAuthGuard);
jest.mock('@/components/AuthGuard', mockAuthGuard);
jest.mock('../../components/AuthGuard', mockAuthGuard);
jest.mock('../../../components/AuthGuard', mockAuthGuard);

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

// Default fetch mock for tests that don't override it
if (!global.fetch) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: async () => ({}),
      text: async () => '',
      status: 200,
      statusText: 'OK',
    } as Response)
  );
}


