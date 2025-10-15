import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase client for Deno Edge Functions
export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Database operations for surveys
export async function createSurvey(supabase: any, data: {
  user_id: string;
  scope: 'general' | 'product';
  product_type?: string;
}) {
  const { data: survey, error } = await supabase
    .from('surveys')
    .insert({
      user_id: data.user_id,
      scope: data.scope,
      product_type: data.product_type
    })
    .select()
    .single();

  if (error) throw error;
  return survey;
}

// Database operations for survey responses
export async function insertSurveyResponses(supabase: any, data: {
  survey_id: string;
  responses: Array<{
    questionId: string;
    answerId: string;
    numericValue: number;
  }>;
}) {
  const responseData = data.responses.map(r => ({
    survey_id: data.survey_id,
    question_id: r.questionId,
    answer_id: r.answerId,
    numeric_value: r.numericValue
  }));

  const { error } = await supabase
    .from('survey_responses')
    .insert(responseData);

  if (error) throw error;
}

// Database operations for scores
export async function insertScore(supabase: any, data: {
  survey_id: string;
  score: {
    people: number;
    planet: number;
    materials: number;
    circularity: number;
    total: number;
    grade: string;
  };
}) {
  const { error } = await supabase
    .from('scores')
    .insert({
      survey_id: data.survey_id,
      people: data.score.people,
      planet: data.score.planet,
      materials: data.score.materials,
      circularity: data.score.circularity,
      total: data.score.total,
      grade: data.score.grade
    });

  if (error) throw error;
}

// Database operations for dashboard
export async function fetchUserSurveys(supabase: any, userId: string) {
  const { data: surveys, error } = await supabase
    .from('surveys')
    .select(`
      id,
      scope,
      product_type,
      scores (
        people,
        planet,
        materials,
        circularity,
        total,
        grade
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return surveys;
}

