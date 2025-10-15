import { z } from "zod";
import { errorResponse, jsonResponse, rateLimitCheck } from "../_shared/utils";
import { calculateCompleteSurveyScore, type SurveyScore } from "../../../lib/scoring/engine";

// Schema para el nuevo sistema
export const payloadSchema = z.object({
  scope: z.enum(["general", "product"]),
  product_type: z.string().optional(), // Solo para scope="product"
  answers: z.array(
    z.object({
      questionId: z.string(),
      answerId: z.string(),
      numericValue: z.number()
    })
  )
});

export type ScoringDeps = ReturnType<typeof scoringHandlerDeps>;

export function scoringHandlerDeps(factory: {
  createSurvey: (args: {
    userId: string;
    scope: 'general' | 'product';
    productType?: string;
  }) => Promise<{ surveyId: string }>;
  insertSurveyResponses: (args: {
    surveyId: string;
    responses: Array<{ questionId: string; answerId: string; numericValue: number }>;
  }) => Promise<void>;
  insertScore: (args: {
    surveyId: string;
    score: SurveyScore;
  }) => Promise<void>;
  invalidateDashboard?: (args: { userId: string }) => Promise<void>;
}) {
  return factory;
}

export function scoringHandler(deps: ScoringDeps) {
  return async function handler(req: Request) {
    try {
      // Rate limiting
      const clientIp = (req.headers as any)?.get?.("x-client-ip") || "anon";
      const rl = await rateLimitCheck("scoring:" + clientIp);
      if (!rl.allowed) return errorResponse(429, "Too Many Requests");

      // Parse request
      const json = await (req as any).json();
      const parsed = payloadSchema.safeParse(json);
      if (!parsed.success) {
        return errorResponse(400, "Bad Request", parsed.error.flatten());
      }

      // Extract user ID from JWT (this would be done in the real function)
      const userId = "user-id-from-jwt"; // Placeholder

      // Create survey
      const survey = await deps.createSurvey({
        userId,
        scope: parsed.data.scope,
        productType: parsed.data.product_type
      });

      // Insert survey responses
      await deps.insertSurveyResponses({
        surveyId: survey.surveyId,
        responses: parsed.data.answers
      });

      // Calculate score
      const score = calculateCompleteSurveyScore(
        parsed.data.answers,
        parsed.data.scope,
        parsed.data.product_type
      );
      score.surveyId = survey.surveyId;

      // Save score
      await deps.insertScore({
        surveyId: survey.surveyId,
        score
      });

      // Invalidate dashboard cache
      if (deps.invalidateDashboard) {
        deps.invalidateDashboard({ userId }).catch(() => {});
      }

      return jsonResponse({
        surveyId: survey.surveyId,
        score: {
          people: score.scores.people,
          planet: score.scores.planet,
          materials: score.scores.materials,
          circularity: score.scores.circularity,
          total: score.total,
          grade: score.grade
        }
      });
    } catch (e) {
      console.error("Scoring handler error:", e);
      return errorResponse(500, "Internal Server Error");
    }
  };
}


