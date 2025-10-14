export const SUPABASE_FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL || "";

export function scoringEndpointPath(): string {
  if (SUPABASE_FUNCTIONS_URL) {
    return `${SUPABASE_FUNCTIONS_URL.replace(/\/$/, "")}/scoring`;
  }
  return "/functions/v1/scoring";
}


