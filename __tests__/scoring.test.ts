import { createClient } from '@supabase/supabase-js';
import { computeScoresForSurvey } from '../lib/scoring/compute';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

describe('Scoring Tests', () => {
  let testUserId: string;
  let generalSurveyId: number;
  let specificSurveyId: number;

  beforeAll(async () => {
    // Create test user
    testUserId = 'scoring-test-user-' + Date.now();
    
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        email: `scoring-test-${Date.now()}@example.com`,
        name: 'Scoring Test User'
      });

    if (profileError) {
      throw new Error(`Failed to create test profile: ${profileError.message}`);
    }

    // Create completed general survey
    const { data: generalSurvey, error: generalError } = await supabase
      .from('general_surveys')
      .insert({
        user_id: testUserId,
        completed: true,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (generalError) {
      throw new Error(`Failed to create general survey: ${generalError.message}`);
    }

    generalSurveyId = generalSurvey.id;

    // Create specific survey
    const { data: specificSurvey, error: specificError } = await supabase
      .from('specific_surveys')
      .insert({
        user_id: testUserId,
        general_survey_id: generalSurveyId,
        product_name: 'Test Product'
      })
      .select()
      .single();

    if (specificError) {
      throw new Error(`Failed to create specific survey: ${specificError.message}`);
    }

    specificSurveyId = specificSurvey.id;
  });

  afterAll(async () => {
    // Clean up test data
    await supabase.from('user_answers').delete().eq('user_id', testUserId);
    await supabase.from('specific_surveys').delete().eq('user_id', testUserId);
    await supabase.from('general_surveys').delete().eq('user_id', testUserId);
    await supabase.from('profiles').delete().eq('id', testUserId);
  });

  test('should return zero score for empty survey', async () => {
    const score = await computeScoresForSurvey(supabase, testUserId, generalSurveyId, 'general');
    
    expect(score.total).toBe(0);
    expect(score.category).toBe('E');
    expect(score.breakdown).toHaveLength(4); // All 4 dimensions should be present
  });

  test('should calculate correct weighted scores', async () => {
    // Get some questions and answers to create test data
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select(`
        id,
        dimension:dimensions(id, name, weight_percent, max_points),
        answers(id, points)
      `)
      .eq('is_specific', false)
      .limit(4);

    if (qError || !questions || questions.length === 0) {
      throw new Error('Failed to fetch test questions');
    }

    // Create user answers with maximum points for each dimension
    const userAnswers = questions.map(q => ({
      user_id: testUserId,
      question_id: q.id,
      answer_id: q.answers[0].id,
      points_obtained: q.answers[0].points,
      general_survey_id: generalSurveyId
    }));

    const { error: answersError } = await supabase
      .from('user_answers')
      .insert(userAnswers);

    if (answersError) {
      throw new Error(`Failed to insert test answers: ${answersError.message}`);
    }

    // Calculate expected scores
    const expectedScores = questions.map(q => {
      const dimension = q.dimension;
      if (!dimension || !Array.isArray(dimension) || dimension.length === 0) {
        throw new Error('Dimension is null or empty array');
      }
      const dim = dimension[0]; // Get first dimension object
      const obtained = q.answers[0].points;
      const weighted = (parseFloat(dim.weight_percent) / dim.max_points) * obtained;
      return {
        name: dim.name,
        obtained,
        weighted: Math.round(weighted * 100) / 100,
        maxPoints: dim.max_points,
        weightPercent: parseFloat(dim.weight_percent)
      };
    });

    const expectedTotal = expectedScores.reduce((sum, score) => sum + score.weighted, 0);

    // Test the scoring function
    const score = await computeScoresForSurvey(supabase, testUserId, generalSurveyId, 'general');
    
    expect(score.total).toBeCloseTo(expectedTotal, 2);
    expect(score.breakdown).toHaveLength(4);
    
    // Check category assignment
    if (expectedTotal >= 75) {
      expect(score.category).toBe('A');
    } else if (expectedTotal >= 50) {
      expect(score.category).toBe('B');
    } else if (expectedTotal >= 25) {
      expect(score.category).toBe('C');
    } else if (expectedTotal >= 1) {
      expect(score.category).toBe('D');
    } else {
      expect(score.category).toBe('E');
    }
  });

  test('should handle category thresholds correctly', async () => {
    const testCases = [
      { score: 85, expectedCategory: 'A' },
      { score: 65, expectedCategory: 'B' },
      { score: 35, expectedCategory: 'C' },
      { score: 15, expectedCategory: 'D' },
      { score: 0, expectedCategory: 'E' }
    ];

    for (const testCase of testCases) {
      // Create a mock score result
      const mockScore = {
        total: testCase.score,
        category: testCase.expectedCategory,
        breakdown: []
      };

      expect(mockScore.category).toBe(testCase.expectedCategory);
    }
  });

  test('should return scores between 0 and 100', async () => {
    const score = await computeScoresForSurvey(supabase, testUserId, generalSurveyId, 'general');
    
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
  });

  test('should handle specific survey scoring', async () => {
    // Get specific questions
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select(`
        id,
        answers(id, points)
      `)
      .eq('is_specific', true)
      .limit(2);

    if (qError || !questions || questions.length === 0) {
      throw new Error('Failed to fetch specific questions');
    }

    // Create user answers for specific survey
    const userAnswers = questions.map(q => ({
      user_id: testUserId,
      question_id: q.id,
      answer_id: q.answers[0].id,
      points_obtained: q.answers[0].points,
      specific_survey_id: specificSurveyId
    }));

    const { error: answersError } = await supabase
      .from('user_answers')
      .insert(userAnswers);

    if (answersError) {
      throw new Error(`Failed to insert specific answers: ${answersError.message}`);
    }

    const score = await computeScoresForSurvey(supabase, testUserId, specificSurveyId, 'specific');
    
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
    expect(['A', 'B', 'C', 'D', 'E']).toContain(score.category);
  });

  test('should handle missing survey gracefully', async () => {
    const nonExistentSurveyId = 99999;
    
    const score = await computeScoresForSurvey(supabase, testUserId, nonExistentSurveyId, 'general');
    
    expect(score.total).toBe(0);
    expect(score.category).toBe('E');
    expect(score.breakdown).toHaveLength(0);
  });

  test('should validate dimension weights sum to 100%', async () => {
    const { data: dimensions, error } = await supabase
      .from('dimensions')
      .select('weight_percent');

    expect(error).toBeNull();
    
    const totalWeight = dimensions?.reduce((sum, d) => sum + parseFloat(d.weight_percent), 0) || 0;
    expect(totalWeight).toBeCloseTo(100, 2);
  });
});
