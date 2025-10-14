import { z } from "https://esm.sh/zod@3.23.8";
import { errorResponse, jsonResponse, rateLimitCheck } from "../_shared/utils.ts";

export const payloadSchema = z.object({
  survey_type: z.enum(["general", "specific"]),
  survey_version: z.string(),
  brand_id: z.string(),
  answers: z.array(
    z.object({
      question_code: z.string(),
      answer_code: z.string()
    })
  )
});

export type ScoringDeps = ReturnType<typeof scoringHandlerDeps>;

export function scoringHandlerDeps(factory: {
  getSurveyMeta: (args: any) => Promise<any>;
  insertSubmissionTx: (payload: any) => Promise<{ submissionId: string }>;
  computeScoreSnapshot: (payload: any) => {
    total: number;
    perDimension: Record<string, number>;
    grade: string;
    message: string;
  };
  invalidateDashboard?: (args: { brandId?: string; userId?: string }) => Promise<void>;
}) {
  return factory;
}

export function scoringHandler(deps: ScoringDeps) {
  return async function handler(req: Request) {
    try {
      const rl = await rateLimitCheck("scoring:" + (req.headers as any)?.get?.("x-client-ip") || "anon");
      if (!rl.allowed) return errorResponse(429, "Too Many Requests");
      const json = await (req as any).json();
      const parsed = payloadSchema.safeParse(json);
      if (!parsed.success) {
        return errorResponse(400, "Bad Request", parsed.error.flatten());
      }
      await deps.getSurveyMeta({ version: parsed.data.survey_version });
      const tx = await deps.insertSubmissionTx(parsed.data);
      const snapshot = deps.computeScoreSnapshot(parsed.data);
      // Fire-and-forget dashboard cache invalidation if provided
      if (deps.invalidateDashboard) {
        // brand_id present in payload; user id will be resolved in real function
        deps.invalidateDashboard({ brandId: parsed.data.brand_id }).catch(() => {});
      }
      return jsonResponse({ submission_id: tx.submissionId, scores: snapshot, grade: snapshot.grade });
    } catch (e) {
      return errorResponse(500, "Internal Server Error");
    }
  };
}


