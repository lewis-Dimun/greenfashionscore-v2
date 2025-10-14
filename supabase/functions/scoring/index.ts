import { scoringHandler, scoringHandlerDeps } from "./handler";
import { withClient } from "../../../lib/db";
import { computeTotalScore, gradeFromTotal, computeCategoryPercent } from "../../../lib/scoring/engine";
import { mapAnswersToPoints } from "../../../lib/scoring/mapping";

const deps = scoringHandlerDeps({
  getSurveyMeta: async () => ({ version: "v1" }),
  insertSubmissionTx: async (payload: any) => {
    const id = await withClient(async (c) => {
      await c.query("BEGIN");
      try {
        const subm = await c.query(
          `INSERT INTO survey_submissions (user_id, survey_id, brand_id)
           VALUES ($1,$2,$3) RETURNING id`,
          [null, payload.survey_id || '00000000-0000-0000-0000-000000000000', payload.brand_id || null]
        );
        const submissionId = subm.rows[0].id as string;
        // Persist responses (normalized_value placeholder for now)
        const points = mapAnswersToPoints(payload.answers || []);
        for (const ans of payload.answers || []) {
          const norm = Number(points[ans.question_code] ?? 0);
          await c.query(
            `INSERT INTO responses (submission_id, question_code, raw_value, normalized_value)
             VALUES ($1, $2, $3, $4)`,
            [submissionId, ans.question_code, JSON.stringify({ answer_code: ans.answer_code }), norm]
          );
        }
        await c.query("COMMIT");
        return submissionId;
      } catch (e) {
        await c.query("ROLLBACK");
        throw e;
      }
    });
    return { submissionId: id };
  },
  computeScoreSnapshot: (_payload: any) => {
    // Placeholder snapshot (expects real per-dimension sums later)
    const perDimension = { people: 0, planet: 0, materials: 0, circularity: 0 } as const;
    const total = computeTotalScore([perDimension.people, perDimension.planet, perDimension.circularity, perDimension.materials]);
    const grade = gradeFromTotal(total);
    return { total, perDimension: { ...perDimension }, grade, message: "" };
  },
  invalidateDashboard: async (_args: { brandId?: string; userId?: string }) => {
    // No-op for now; ETag is weakly derived on each GET
  }
});

export default {
  fetch: async (req: Request) => {
    const handler = scoringHandler({
      ...deps,
      insertSubmissionTx: deps.insertSubmissionTx
    });
    // call handler first to validate and compute snapshot
    const res = await handler(req);
    try {
      const body = await (res as any).json();
      if (res.status === 200 && body?.submission_id && body?.scores) {
        const submissionId = body.submission_id as string;
        // Recompute snapshot from stored responses
        const perDimension = await withClient(async (c) => {
          const r = await c.query(
            `SELECT question_code, coalesce(normalized_value,0) AS v
             FROM responses WHERE submission_id = $1`,
            [submissionId]
          );
          const sums = { people: 0, planet: 0, circularity: 0, materials: 0 } as Record<string, number>;
          for (const row of r.rows) {
            const q: string = row.question_code || "";
            const v = Number(row.v) || 0;
            if (q.startsWith("PEO")) sums.people += v;
            else if (q.startsWith("PLA")) sums.planet += v;
            else if (q.startsWith("CIR")) sums.circularity += v;
            else if (q.startsWith("MAT")) sums.materials += v;
          }
          return sums as { people: number; planet: number; circularity: number; materials: number };
        });
        const cat = [
          computeCategoryPercent(perDimension.people, 50, 20),
          computeCategoryPercent(perDimension.planet, 50, 20),
          computeCategoryPercent(perDimension.circularity, 50, 20),
          computeCategoryPercent(perDimension.materials, 65, 40)
        ];
        const total = computeTotalScore(cat);
        // Try thresholds from DB; fallback to default gradeFromTotal
        const grade = await withClient(async (c) => {
          try {
            const q = await c.query(`SELECT thresholds FROM grading_thresholds ORDER BY version DESC LIMIT 1`);
            if (q.rows.length) {
              const t = q.rows[0].thresholds as any;
              const decide = (x: number): string => {
                if (x >= t.A[0] && x <= t.A[1]) return "A";
                if (x >= t.B[0] && x <= t.B[1]) return "B";
                if (x >= t.C[0] && x <= t.C[1]) return "C";
                if (x >= t.D[0] && x <= t.D[1]) return "D";
                return "E";
              };
              return decide(total);
            }
          } catch {}
          return gradeFromTotal(total);
        });
        await withClient(async (c) => {
          await c.query(
            `INSERT INTO scores (submission_id, total, per_dimension, grade)
             VALUES ($1, $2, $3, $4)`,
            [submissionId, total, perDimension as any, grade]
          );
        });
      }
    } catch {
      // ignore JSON parse errors (e.g., error responses)
    }
    return res;
  }
};


