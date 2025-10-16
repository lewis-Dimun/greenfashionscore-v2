import { fetch, Request, Response, Headers, FormData } from 'undici';

if (!(globalThis as any).fetch) Object.assign(globalThis, { fetch });
if (!(globalThis as any).Request) Object.assign(globalThis, { Request });
if (!(globalThis as any).Response) Object.assign(globalThis, { Response });
if (!(globalThis as any).Headers) Object.assign(globalThis, { Headers });
if (!(globalThis as any).FormData) Object.assign(globalThis, { FormData });
if (!(globalThis as any).File) Object.assign(globalThis, { File });

// Polyfill for Edge runtime
if (!global.structuredClone) {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Mock Deno environment for Edge Functions
(global as any).Deno = {
  env: {
    get: (key: string) => process.env[key]
  }
};


