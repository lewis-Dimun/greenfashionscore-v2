export const SUPABASE_FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL || "";

export function scoringEndpointPath(): string {
  if (SUPABASE_FUNCTIONS_URL) {
    return `${SUPABASE_FUNCTIONS_URL.replace(/\/$/, "")}/scoring`;
  }
  return "/functions/v1/scoring";
}

export const FUNCTIONS_HEADERS = (() => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return {
    "content-type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`
  } as Record<string, string>;
})();


