// Fetch + Request/Response in jsdom
import 'whatwg-fetch';
import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

// Mock fetch globally
global.fetch = jest.fn();

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
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
jest.mock('./components/AuthGuard', () => {
  return function MockAuthGuard({ children }: { children: any }) {
    return children;
  };
});

jest.mock('@/components/AuthGuard', () => {
  return function MockAuthGuard({ children }: { children: any }) {
    return children;
  };
});

// Removed problematic AuthGuard mock

// Removed problematic AuthGuard mock

// Polyfill ResizeObserver for Recharts
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = (global as any).ResizeObserver || ResizeObserver;

// Ensure Fetch API globals exist (Node 20 via undici)
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  const { fetch, Headers, Request, Response } = require('undici');
  if (!(global as any).fetch) (global as any).fetch = fetch;
  if (!(global as any).Headers) (global as any).Headers = Headers;
  if (!(global as any).Request) (global as any).Request = Request;
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


