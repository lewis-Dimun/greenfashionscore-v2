import { z } from "zod";
import { scoringHandlerDeps, scoringHandler } from "../supabase/functions/scoring/handler";

describe("API - scoring handler", () => {
  const deps = scoringHandlerDeps({
    getSurveyMeta: async () => ({ version: "v1" }),
    insertSubmissionTx: async (_payload: any) => ({
      submissionId: "subm_123"
    }),
    computeScoreSnapshot: (_payload: any) => ({
      total: 72,
      perDimension: { people: 14, planet: 18, materials: 30, circularity: 10 },
      grade: "B",
      message: "Buena circularidad y sostenibilidad"
    })
  });

  it("valida input con Zod y responde con snapshot", async () => {
    const req = {
      json: async () => ({
        survey_type: "general",
        survey_version: "v1",
        brand_id: "00000000-0000-0000-0000-000000000001",
        answers: [{ question_code: "PEO_Q1", answer_code: "A1" }]
      })
    } as any;

    const res = await scoringHandler(deps)(req as any);
    expect(res.status).toBe(200);
    const body = await (res as any).json();
    expect(body).toHaveProperty("submission_id");
    expect(body).toHaveProperty("scores.total");
    expect(body).toHaveProperty("grade", "B");
  });

  it("rechaza payload inválido", async () => {
    const req = { json: async () => ({}) } as any;
    const res = await scoringHandler(deps)(req);
    expect(res.status).toBe(400);
  });
});


