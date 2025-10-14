export function computeCategoryPercent(score: number, maxPoints: number, weightPercent: number): number {
  if (maxPoints <= 0 || weightPercent <= 0) return 0;
  const capped = Math.min(Math.max(score, 0), maxPoints);
  return (capped / maxPoints) * weightPercent;
}

export function computeTotalScore(categoryPercents: number[]): number {
  return categoryPercents.reduce((acc, n) => acc + (Number.isFinite(n) ? n : 0), 0);
}

export function gradeFromTotal(total: number): "A" | "B" | "C" | "D" | "E" {
  if (total >= 75) return "A";
  if (total >= 50) return "B";
  if (total >= 25) return "C";
  if (total >= 1) return "D";
  return "E";
}


