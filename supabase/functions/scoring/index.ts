import { scoringHandler, scoringHandlerDeps } from "./handler.deno.ts";
import { computeTotalScore, gradeFromTotal, computeCategoryPercent } from "../_shared/engine.ts";
import { mapAnswersToPoints } from "../_shared/mapping.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { errorResponse } from "../_shared/utils.ts";

const deps = scoringHandlerDeps({
  getSurveyMeta: async () => ({ version: "v1" }),
  insertSubmissionTx: async (payload: any) => {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: subm, error: errSub } = await supabase
      .from("survey_submissions")
      .insert({ user_id: null, survey_id: payload.survey_id, brand_id: payload.brand_id })
      .select("id")
      .single();
    if (errSub) throw errSub;
    const submissionId = subm.id as string;
    const points = mapAnswersToPoints(payload.answers || []);
    const rows = (payload.answers || []).map((ans: any) => ({
      submission_id: submissionId,
      question_code: ans.question_code,
      raw_value: { answer_code: ans.answer_code },
      normalized_value: Number(points[ans.question_code] ?? 0)
    }));
    if (rows.length) {
      const { error: errRes } = await supabase.from("responses").insert(rows);
      if (errRes) throw errRes;
    }
    return { submissionId };
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

const runtime = {
  fetch: async (req: Request) => {
    try {
      const handler = scoringHandler({ ...deps });
      const res = await handler(req);
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceKey);
      try {
        const body = await (res as any).json();
        if (res.status === 200 && body?.submission_id) {
          const submissionId = body.submission_id as string;
          const { data: resp } = await supabase
            .from("responses")
            .select("question_code, normalized_value")
            .eq("submission_id", submissionId);
          const sums: Record<string, number> = { people: 0, planet: 0, circularity: 0, materials: 0 };
          for (const r of resp || []) {
            const q = r.question_code as string;
            const v = Number(r.normalized_value || 0);
            if (q.startsWith("PEO")) sums.people += v;
            else if (q.startsWith("PLA")) sums.planet += v;
            else if (q.startsWith("CIR")) sums.circularity += v;
            else if (q.startsWith("MAT")) sums.materials += v;
          }
          const cat = [
            computeCategoryPercent(sums.people, 50, 20),
            computeCategoryPercent(sums.planet, 50, 20),
            computeCategoryPercent(sums.circularity, 50, 20),
            computeCategoryPercent(sums.materials, 65, 40)
          ];
          const total = computeTotalScore(cat);
          // thresholds
          const { data: thr } = await supabase
            .from("grading_thresholds")
            .select("thresholds")
            .order("version", { ascending: false })
            .limit(1)
            .single();
          const t = (thr?.thresholds as any) || { A: [75, 100], B: [50, 74], C: [25, 49], D: [1, 24], E: [0, 0] };
          const decide = (x: number): string => {
            if (x >= t.A[0] && x <= t.A[1]) return "A";
            if (x >= t.B[0] && x <= t.B[1]) return "B";
            if (x >= t.C[0] && x <= t.C[1]) return "C";
            if (x >= t.D[0] && x <= t.D[1]) return "D";
            return "E";
          };
          const grade = decide(total);
          await supabase.from("scores").insert({ submission_id: submissionId, total, per_dimension: sums, grade });
        }
      } catch {
        // ignore
      }
      return res;
    } catch (e) {
      return errorResponse(500, "Internal Server Error", String(e));
    }
  }
};

export default runtime;


