export function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
    status: init?.status ?? 200
  });
}

export function errorResponse(status: number, message: string, details?: unknown): Response {
  return jsonResponse(
    {
      error: {
        status,
        message,
        details: details ?? null
      }
    },
    { status }
  );
}

export function sanitizeText(input: string): string {
  return input.replace(/[\u0000-\u001F\u007F<>]/g, "").trim();
}

export function weakEtagFromString(s: string): string {
  const hash = crypto.subtle ? undefined : undefined; // placeholder for Deno/Node differences
  // Simple, deterministic weak etag substitute for now
  const base = Array.from(s).reduce((a, c) => (a + c.charCodeAt(0)) % 100000, 0);
  return `W/"${base.toString()}"`;
}

export async function rateLimitCheck(_key: string): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  // TODO: Plug a KV store (e.g., Upstash, Supabase KV) for real limits
  return { allowed: true };
}


