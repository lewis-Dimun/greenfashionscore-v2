import { jsonResponse } from "../_shared/utils";
import { aggregateScores, type AggregatedScore } from "../../../lib/scoring/engine";

export type DashboardDeps = ReturnType<typeof dashboardHandlerDeps>;

export function dashboardHandlerDeps(factory: {
  fetchUserSurveys: (args: { userId: string }) => Promise<Array<{
    surveyId: string;
    scope: 'general' | 'product';
    productType?: string;
    scores: {
      people: number;
      planet: number;
      materials: number;
      circularity: number;
      total: number;
      grade: string;
    };
  }>>;
}) {
  return factory;
}

export function dashboardHandler(deps: DashboardDeps) {
  return async function handler(req: Request) {
    try {
      // Extract user ID from JWT (this would be done in the real function)
      const userId = "user-id-from-jwt"; // Placeholder

      // Fetch all user surveys with scores
      const surveys = await deps.fetchUserSurveys({ userId }) || [];

      if (!Array.isArray(surveys) || surveys.length === 0) {
        return jsonResponse({
          people: 0,
          planet: 0,
          materials: 0,
          circularity: 0,
          total: 0,
          grade: 'E',
          breakdown: []
        });
      }

      // Separate general and product surveys
      const generalSurvey = surveys.find(s => s.scope === 'general');
      const productSurveys = surveys.filter(s => s.scope === 'product');

      if (!generalSurvey) {
        return jsonResponse({
          people: 0,
          planet: 0,
          materials: 0,
          circularity: 0,
          total: 0,
          grade: 'E',
          breakdown: surveys
        });
      }

      // Convert to SurveyScore format for aggregation
      const generalScore = {
        surveyId: generalSurvey.surveyId,
        scope: 'general' as const,
        scores: generalSurvey.scores,
        total: generalSurvey.scores.total,
        grade: generalSurvey.scores.grade as 'A' | 'B' | 'C' | 'D' | 'E'
      };

      const productScores = productSurveys.map(survey => ({
        surveyId: survey.surveyId,
        scope: 'product' as const,
        productType: survey.productType,
        scores: survey.scores,
        total: survey.scores.total,
        grade: survey.scores.grade as 'A' | 'B' | 'C' | 'D' | 'E'
      }));

      // Aggregate scores
      const aggregated = aggregateScores(generalScore, productScores);

      // Generate ETag based on last survey update
      const etag = `"${JSON.stringify(aggregated).length}"`;

      // Check for ETag match
      const ifNoneMatch = (req.headers as any)?.get?.("if-none-match");
      if (ifNoneMatch && ifNoneMatch === etag) {
        return new Response(null, { status: 304, headers: { ETag: etag } });
      }

      return jsonResponse(aggregated, {
        status: 200,
        headers: { ETag: etag }
      });
    } catch (e) {
      console.error("Dashboard handler error:", e);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  };
}


