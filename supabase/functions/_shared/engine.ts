// Scoring engine for Edge Functions (Deno-compatible)

export type CategoryScores = {
  people: number;
  planet: number;
  materials: number;
  circularity: number;
};

export type SurveyScore = {
  surveyId: string;
  scope: 'general' | 'product';
  productType?: string;
  scores: CategoryScores;
  total: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
};

// Máximos RAW por categoría según Excel (total 384)
const RAW_MAX_SCORES: CategoryScores = {
  people: 44,
  planet: 50,
  materials: 65,
  circularity: 225
};

// Máximos DISPLAY por categoría (prorrateados a 100: 20/20/40/20)
const DISPLAY_MAX_SCORES: CategoryScores = {
  people: 20,
  planet: 20,
  materials: 40,
  circularity: 20
};

const DISPLAY_TOTAL_MAX = 100;

// Función para calcular score por categoría con cap
export function computeRawCategorySum(scores: number[], category: keyof CategoryScores): number {
  const rawMax = RAW_MAX_SCORES[category];
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.min(Math.max(sum, 0), rawMax);
}

// Convierte puntajes RAW por categoría a escala DISPLAY por categoría
export function normalizeCategory(rawValue: number, category: keyof CategoryScores): number {
  const rawMax = RAW_MAX_SCORES[category];
  const displayMax = DISPLAY_MAX_SCORES[category];
  if (rawMax <= 0) return 0;
  const ratio = rawValue / rawMax;
  return Math.min(Math.max(ratio * displayMax, 0), displayMax);
}

// Función para calcular total DISPLAY con cap 100
export function computeDisplayTotal(categoryDisplayScores: CategoryScores): number {
  const total = Object.values(categoryDisplayScores).reduce((acc, score) => acc + score, 0);
  return Math.min(total, DISPLAY_TOTAL_MAX);
}

// Función para asignar grade A-E
export function gradeFromTotal(total: number): 'A' | 'B' | 'C' | 'D' | 'E' {
  if (total >= 75) return 'A';
  if (total >= 50) return 'B';
  if (total >= 25) return 'C';
  if (total >= 1) return 'D';
  return 'E';
}

// Función para calcular score de una encuesta completa
export function calculateCompleteSurveyScore(
  responses: Array<{ questionId: string; answerId: string; numericValue: number }>,
  scope: 'general' | 'product',
  productType?: string
): SurveyScore {
  // Agrupar respuestas por categoría (esto requeriría consultar la DB)
  // Por simplicidad, asumimos que los questionId ya tienen prefijos de categoría
  const rawPeople = computeRawCategorySum(
    responses.filter(r => r.questionId.startsWith('people_')).map(r => r.numericValue),
    'people'
  );
  const rawPlanet = computeRawCategorySum(
    responses.filter(r => r.questionId.startsWith('planet_')).map(r => r.numericValue),
    'planet'
  );
  const rawMaterials = computeRawCategorySum(
    responses.filter(r => r.questionId.startsWith('materials_')).map(r => r.numericValue),
    'materials'
  );
  const rawCircularity = computeRawCategorySum(
    responses.filter(r => r.questionId.startsWith('circularity_')).map(r => r.numericValue),
    'circularity'
  );

  const scores: CategoryScores = {
    people: normalizeCategory(rawPeople, 'people'),
    planet: normalizeCategory(rawPlanet, 'planet'),
    materials: normalizeCategory(rawMaterials, 'materials'),
    circularity: normalizeCategory(rawCircularity, 'circularity')
  };

  const total = computeDisplayTotal(scores);
  const grade = gradeFromTotal(total);

  return {
    surveyId: '', // Se asignará al guardar en DB
    scope,
    productType,
    scores,
    total,
    grade
  };
}

// Función para agregar scores de encuesta general + productos
export function aggregateScores(
  generalScore: SurveyScore,
  productScores: SurveyScore[]
): {
  people: number;
  planet: number;
  materials: number;
  circularity: number;
  total: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  breakdown: SurveyScore[];
} {
  // Sumar scores de general + todos los productos
  const aggregatedRaw: CategoryScores = {
    people: generalScore.scores.people,
    planet: generalScore.scores.planet,
    materials: generalScore.scores.materials,
    circularity: generalScore.scores.circularity
  };

  // Agregar scores de productos (ya están en escala DISPLAY)
  productScores.forEach(productScore => {
    aggregatedRaw.people = Math.min(aggregatedRaw.people + productScore.scores.people, DISPLAY_MAX_SCORES.people);
    aggregatedRaw.planet = Math.min(aggregatedRaw.planet + productScore.scores.planet, DISPLAY_MAX_SCORES.planet);
    aggregatedRaw.materials = Math.min(aggregatedRaw.materials + productScore.scores.materials, DISPLAY_MAX_SCORES.materials);
    aggregatedRaw.circularity = Math.min(aggregatedRaw.circularity + productScore.scores.circularity, DISPLAY_MAX_SCORES.circularity);
  });

  const total = computeDisplayTotal(aggregatedRaw);
  const grade = gradeFromTotal(total);

  return {
    ...aggregatedRaw,
    total,
    grade,
    breakdown: [generalScore, ...productScores]
  };
}