/*
  Excel ingest scaffolding (idempotent, versioned upserts by code+version)
  Note: Implementation will be completed after DB connection utilities are added.
*/

export type DimensionRow = {
  code: string;
  name: string;
  order: number;
  max_points: number;
  weight_percent: number;
  version: string;
};

export type GradingThresholdsRow = {
  version: string;
  thresholds: { A: [number, number]; B: [number, number]; C: [number, number]; D: [number, number]; E: [number, number] };
};

export type GlobalWeightsRow = {
  version: string;
  global_distribution: { general: number; specifics: number };
};

import { withClient } from "../db";
import * as XLSX from "xlsx";

export async function upsertDimensions(rows: DimensionRow[]): Promise<void> {
  if (!rows.length) return;
  await withClient(async (c) => {
    for (const r of rows) {
      await c.query(
        `INSERT INTO dimensions (code, name, "order", max_points, weight_percent)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, "order" = EXCLUDED."order", max_points = EXCLUDED.max_points, weight_percent = EXCLUDED.weight_percent`,
        [r.code, r.name, r.order, r.max_points, r.weight_percent]
      );
    }
  });
}

export async function upsertGradingThresholds(row: GradingThresholdsRow): Promise<void> {
  // Defaults if not provided
  const defaults: GradingThresholdsRow = {
    version: row.version,
    thresholds: row.thresholds || { A: [75, 100], B: [50, 74], C: [25, 49], D: [1, 24], E: [0, 0] }
  };
  await withClient(async (c) => {
    await c.query(
      `INSERT INTO grading_thresholds (version, thresholds)
       VALUES ($1, $2)
       ON CONFLICT (version) DO UPDATE SET thresholds = EXCLUDED.thresholds`,
      [defaults.version, defaults.thresholds as any]
    );
  });
}

export async function upsertGlobalWeights(row: GlobalWeightsRow): Promise<void> {
  const defaults: GlobalWeightsRow = {
    version: row.version,
    global_distribution: row.global_distribution || { general: 0.6, specifics: 0.4 }
  };
  await withClient(async (c) => {
    await c.query(
      `INSERT INTO weights (version, global_distribution)
       VALUES ($1, $2)
       ON CONFLICT (version) DO UPDATE SET global_distribution = EXCLUDED.global_distribution`,
      [defaults.version, defaults.global_distribution as any]
    );
  });
}

export async function ingestFromExcel(_excelPath: string): Promise<void> {
  const excelPath = _excelPath;
  if (!excelPath) throw new Error("Missing Excel path");
  const wb = XLSX.readFile(excelPath);
  // Expect sheets: Dimensions, GradingThresholds, GlobalWeights
  const dimsSheet = wb.Sheets["Dimensions"]; 
  if (dimsSheet) {
    const rows = XLSX.utils.sheet_to_json<any>(dimsSheet);
    const parsed: DimensionRow[] = rows.map((r, i) => ({
      code: String(r.code || r.CODE),
      name: String(r.name || r.NAME),
      order: Number(r.order ?? i + 1),
      max_points: Number(r.max_points ?? r.max ?? 0),
      weight_percent: Number(r.weight_percent ?? r.weight ?? 0),
      version: String(r.version || "v1")
    }));
    await upsertDimensions(parsed);
  }
  const thrSheet = wb.Sheets["GradingThresholds"]; 
  if (thrSheet) {
    const [row] = XLSX.utils.sheet_to_json<any>(thrSheet) as any[];
    const thresholds = {
      A: [Number(row.A_min ?? 75), Number(row.A_max ?? 100)] as [number, number],
      B: [Number(row.B_min ?? 50), Number(row.B_max ?? 74)] as [number, number],
      C: [Number(row.C_min ?? 25), Number(row.C_max ?? 49)] as [number, number],
      D: [Number(row.D_min ?? 1), Number(row.D_max ?? 24)] as [number, number],
      E: [Number(row.E_min ?? 0), Number(row.E_max ?? 0)] as [number, number]
    };
    await upsertGradingThresholds({ version: String(row.version || "v1"), thresholds });
  }
  const weightsSheet = wb.Sheets["GlobalWeights"]; 
  if (weightsSheet) {
    const [row] = XLSX.utils.sheet_to_json<any>(weightsSheet) as any[];
    await upsertGlobalWeights({
      version: String(row.version || "v1"),
      global_distribution: {
        general: Number(row.general ?? 0.6),
        specifics: Number(row.specifics ?? 0.4)
      }
    });
  }
}

// CLI entrypoint
if (require.main === module) {
  const [, , excel] = process.argv;
  ingestFromExcel(excel)
    .then(() => {
      // eslint-disable-next-line no-console
      console.log("Excel ingest completed");
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error(e);
      process.exit(1);
    });
}


