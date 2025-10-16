// Tipos para el nuevo sistema de scoring
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

export type AggregatedScore = {
  people: number;
  planet: number;
  materials: number;
  circularity: number;
  total: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  breakdown: SurveyScore[];
};

// Máximos RAW por categoría según Excel (total 384)
const RAW_MAX_SCORES: CategoryScores = {
  people: 44,
  planet: 50,
  materials: 65,
  circularity: 225
};

const _RAW_TOTAL_MAX = RAW_MAX_SCORES.people + RAW_MAX_SCORES.planet + RAW_MAX_SCORES.materials + RAW_MAX_SCORES.circularity; // 384

// Máximos DISPLAY por categoría (prorrateados a 100: 20/20/40/20)
const DISPLAY_MAX_SCORES: CategoryScores = {
  people: 20,
  planet: 20,
  materials: 40,
  circularity: 20
};

const DISPLAY_TOTAL_MAX = 100;

// Función para calcular score por categoría con cap
// Calcula la suma RAW por categoría con cap al máximo de Excel
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

// Función para calcular score DISPLAY de una categoría de una encuesta
export function calculateSurveyScore(
  responses: Array<{ questionId: string; answerId: string; numericValue: number }>,
  category: keyof CategoryScores
): number {
  const categoryResponses = responses.filter(_r => {
    // Aquí necesitarías filtrar por categoría basado en questionId
    // Por simplicidad, asumimos que ya están filtradas
    return true;
  });
  
  const scores = categoryResponses.map(r => r.numericValue);
  const rawCapped = computeRawCategorySum(scores, category);
  return normalizeCategory(rawCapped, category);
}

// Función para agregar scores de encuesta general + productos
export function aggregateScores(
  generalScore: SurveyScore,
  productScores: SurveyScore[]
): AggregatedScore {
  // Sumar DISPLAY ya normalizado por encuesta, respetando topes DISPLAY por categoría
  const aggregated: CategoryScores = {
    people: generalScore.scores.people,
    planet: generalScore.scores.planet,
    materials: generalScore.scores.materials,
    circularity: generalScore.scores.circularity
  };

  productScores.forEach(productScore => {
    aggregated.people = Math.min(aggregated.people + productScore.scores.people, DISPLAY_MAX_SCORES.people);
    aggregated.planet = Math.min(aggregated.planet + productScore.scores.planet, DISPLAY_MAX_SCORES.planet);
    aggregated.materials = Math.min(aggregated.materials + productScore.scores.materials, DISPLAY_MAX_SCORES.materials);
    aggregated.circularity = Math.min(aggregated.circularity + productScore.scores.circularity, DISPLAY_MAX_SCORES.circularity);
  });

  const total = computeDisplayTotal(aggregated);
  const grade = gradeFromTotal(total);

  return {
    ...aggregated,
    total,
    grade,
    breakdown: [generalScore, ...productScores]
  };
}

// Función para calcular score de una encuesta completa
export function calculateCompleteSurveyScore(
  responses: Array<{ questionId: string; answerId: string; numericValue: number }>,
  scope: 'general' | 'product',
  productType?: string
): SurveyScore {
  // Agrupar respuestas por categoría (esto requeriría consultar la DB)
  // Por simplicidad, asumimos que ya están agrupadas
  const scores: CategoryScores = {
    people: normalizeCategory(
      computeRawCategorySum(
      responses.filter(r => r.questionId.startsWith('people_')).map(r => r.numericValue),
      'people'
      ),
      'people'
    ),
    planet: normalizeCategory(
      computeRawCategorySum(
      responses.filter(r => r.questionId.startsWith('planet_')).map(r => r.numericValue),
      'planet'
      ),
      'planet'
    ),
    materials: normalizeCategory(
      computeRawCategorySum(
      responses.filter(r => r.questionId.startsWith('materials_')).map(r => r.numericValue),
      'materials'
      ),
      'materials'
    ),
    circularity: normalizeCategory(
      computeRawCategorySum(
      responses.filter(r => r.questionId.startsWith('circularity_')).map(r => r.numericValue),
      'circularity'
      ),
      'circularity'
    )
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

// Legacy function names for backward compatibility
export function computeTotalScore(scores: CategoryScores): number {
  return computeDisplayTotal(scores);
}

export function computeCategoryPercent(rawValue: number, category: keyof CategoryScores): number {
  return normalizeCategory(rawValue, category);
}

export function combineGeneralAndSpecifics(general: SurveyScore | null, specifics: SurveyScore[]): AggregatedScore {
  if (!general) {
    // If no general survey, return empty aggregated score
    return {
      people: 0,
      planet: 0,
      materials: 0,
      circularity: 0,
      total: 0,
      grade: 'E',
      breakdown: specifics
    };
  }

  // Calculate weighted average
  const totalSpecifics = specifics.length;
  const generalWeight = 0.6; // 60% weight for general
  const specificWeight = 0.4 / Math.max(totalSpecifics, 1); // 40% divided among specifics

  const aggregated: CategoryScores = {
    people: general.scores.people * generalWeight,
    planet: general.scores.planet * generalWeight,
    materials: general.scores.materials * generalWeight,
    circularity: general.scores.circularity * generalWeight
  };

  // Add specific survey contributions
  specifics.forEach(specific => {
    aggregated.people += specific.scores.people * specificWeight;
    aggregated.planet += specific.scores.planet * specificWeight;
    aggregated.materials += specific.scores.materials * specificWeight;
    aggregated.circularity += specific.scores.circularity * specificWeight;
  });

  const total = computeDisplayTotal(aggregated);
  const grade = gradeFromTotal(total);

  return {
    ...aggregated,
    total,
    grade,
    breakdown: [general, ...specifics]
  };
}


