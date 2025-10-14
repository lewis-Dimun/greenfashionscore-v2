export type DimensionKey = "people" | "planet" | "circularity" | "materials";

export type PerDimensionScores = Record<DimensionKey, number>;

export interface ScoreSnapshot {
  total: number;
  perDimension: PerDimensionScores;
  grade: "A" | "B" | "C" | "D" | "E";
  message: string;
}


