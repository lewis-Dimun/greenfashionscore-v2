import { SupabaseClient } from '@supabase/supabase-js';

export interface CategoryScore {
  name: string;
  obtained: number;
  weighted: number;
  maxPoints: number;
  weightPercent: number;
}

export interface SurveyScore {
  total: number;
  category: 'A' | 'B' | 'C' | 'D' | 'E';
  breakdown: CategoryScore[];
}

const CATEGORY_THRESHOLDS = {
  A: 75,
  B: 50,
  C: 25,
  D: 1,
  E: 0
};

function getCategory(score: number): 'A' | 'B' | 'C' | 'D' | 'E' {
  if (score >= CATEGORY_THRESHOLDS.A) return 'A';
  if (score >= CATEGORY_THRESHOLDS.B) return 'B';
  if (score >= CATEGORY_THRESHOLDS.C) return 'C';
  if (score >= CATEGORY_THRESHOLDS.D) return 'D';
  return 'E';
}

export async function computeScoresForSurvey(
  supabase: SupabaseClient,
  userId: string, 
  surveyId: number, 
  type: 'general' | 'specific'
): Promise<SurveyScore> {
  try {
    // Build the where condition based on survey type
    const surveyWhere = type === 'general' 
      ? { general_survey_id: surveyId }
      : { specific_survey_id: surveyId };

    // Get user answers with question and dimension data
    const { data: answers, error: answersError } = await supabase
      .from('user_answers')
      .select(`
        points_obtained,
        question:questions(
          dimension:dimensions(id, name, weight_percent, max_points)
        )
      `)
      .eq('user_id', userId)
      .eq(surveyWhere);

    if (answersError) {
      throw new Error(`Failed to fetch answers: ${answersError.message}`);
    }

    if (!answers || answers.length === 0) {
      return {
        total: 0,
        category: 'E',
        breakdown: []
      };
    }

    // Group answers by dimension
    const dimensionSums = new Map<number, number>();
    const dimensionInfo = new Map<number, { name: string; weightPercent: number; maxPoints: number }>();

    answers.forEach(answer => {
      const dimension = answer.question.dimension;
      const dimId = dimension.id;
      
      // Initialize dimension info
      if (!dimensionInfo.has(dimId)) {
        dimensionInfo.set(dimId, {
          name: dimension.name,
          weightPercent: parseFloat(dimension.weight_percent),
          maxPoints: dimension.max_points
        });
      }
      
      // Sum points for this dimension
      const currentSum = dimensionSums.get(dimId) || 0;
      dimensionSums.set(dimId, currentSum + answer.points_obtained);
    });

    // Calculate weighted scores
    let totalWeighted = 0;
    const breakdown: CategoryScore[] = [];

    for (const [dimId, obtained] of dimensionSums) {
      const info = dimensionInfo.get(dimId);
      if (!info) continue;

      // Calculate weighted score: (weight_percent / max_points) * obtained
      const weighted = (info.weightPercent / info.maxPoints) * obtained;
      totalWeighted += weighted;

      breakdown.push({
        name: info.name,
        obtained,
        weighted: Math.round(weighted * 100) / 100, // Round to 2 decimal places
        maxPoints: info.maxPoints,
        weightPercent: info.weightPercent
      });
    }

    // Round total to 2 decimal places
    const total = Math.round(totalWeighted * 100) / 100;
    const category = getCategory(total);

    return {
      total,
      category,
      breakdown
    };

  } catch (error) {
    console.error('Error computing scores:', error);
    throw error;
  }
}

export async function computeUserDashboardScores(
  userId: string, 
  supabase: SupabaseClient
): Promise<{
  general?: SurveyScore;
  specific: SurveyScore[];
}> {
  try {
    // Get user's general survey
    const { data: generalSurvey, error: generalError } = await supabase
      .from('general_surveys')
      .select('id, completed')
      .eq('user_id', userId)
      .eq('completed', true)
      .single();

    let generalScore: SurveyScore | undefined;

    if (!generalError && generalSurvey) {
      generalScore = await computeScoresForSurvey(supabase, userId, generalSurvey.id, 'general');
    }

    // Get user's specific surveys
    const { data: specificSurveys, error: specificError } = await supabase
      .from('specific_surveys')
      .select('id, product_name')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const specificScores: SurveyScore[] = [];

    if (!specificError && specificSurveys) {
      for (const survey of specificSurveys) {
        try {
          const score = await computeScoresForSurvey(supabase, userId, survey.id, 'specific');
          specificScores.push({
            ...score,
            // Add product name for context
            productName: survey.product_name
          } as SurveyScore & { productName: string });
        } catch (error) {
          console.error(`Error computing score for specific survey ${survey.id}:`, error);
        }
      }
    }

    return {
      general: generalScore,
      specific: specificScores
    };

  } catch (error) {
    console.error('Error computing dashboard scores:', error);
    throw error;
  }
}
