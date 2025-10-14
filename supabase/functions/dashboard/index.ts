import { dashboardHandler, dashboardHandlerDeps } from "./handler";
import { withClient } from "../../../lib/db";
import { computeTotalScore, gradeFromTotal } from "../../../lib/scoring/engine";
import { weakEtagFromString } from "../_shared/utils";

const deps = dashboardHandlerDeps({
  fetchAggregates: async ({ brandId }) => {
    const latest = await withClient(async (c) => {
      const q = await c.query(
        `SELECT s.per_dimension, s.total, s.grade
         FROM scores s
         JOIN survey_submissions sub ON sub.id = s.submission_id
         WHERE ($1::uuid IS NULL OR sub.brand_id = $1::uuid)
         ORDER BY sub.created_at DESC
         LIMIT 1`,
        [brandId || null]
      );
      if (q.rows.length === 0) {
        return { per_dimension: { people: 0, planet: 0, materials: 0, circularity: 0 }, total: 0, grade: "E" };
      }
      return q.rows[0];
    });
    const per = latest.per_dimension as { people: number; planet: number; materials: number; circularity: number };
    const total = typeof latest.total === "number" ? latest.total : computeTotalScore([per.people, per.planet, per.circularity, per.materials]);
    const grade = typeof latest.grade === "string" ? latest.grade : gradeFromTotal(total);
    const etag = weakEtagFromString(`${brandId || "anon"}:${total}`);
    return { total, perDimension: per, grade, etag };
  }
});

export default { fetch: dashboardHandler(deps) };


