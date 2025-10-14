import { dashboardHandler, dashboardHandlerDeps } from "./handler.ts";
import { computeTotalScore, gradeFromTotal } from "../_shared/engine.ts";
import { weakEtagFromString } from "../_shared/utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const deps = dashboardHandlerDeps({
  fetchAggregates: async ({ brandId }) => {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data } = await supabase
      .from("scores")
      .select("per_dimension, total, grade, survey_submissions!inner(brand_id, created_at)")
      .order("survey_submissions.created_at", { ascending: false })
      .limit(1);
    const row = (data && data[0]) || null;
    const per = (row?.per_dimension as any) || { people: 0, planet: 0, materials: 0, circularity: 0 };
    const total = typeof row?.total === "number" ? row!.total : computeTotalScore([per.people, per.planet, per.circularity, per.materials]);
    const grade = typeof row?.grade === "string" ? row!.grade : gradeFromTotal(total);
    const etag = weakEtagFromString(`${brandId || "anon"}:${total}`);
    return { total, perDimension: per, grade, etag };
  }
});

const runtime = { fetch: dashboardHandler(deps) };
export default runtime;


