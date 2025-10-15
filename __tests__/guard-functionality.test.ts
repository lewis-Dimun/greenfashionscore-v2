import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

describe('Guard Functionality Tests', () => {
  let testUserId: string;
  let generalSurveyId: number;

  beforeAll(async () => {
    // Create a test user profile
    testUserId = 'test-user-' + Date.now();
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        email: `test-${Date.now()}@example.com`,
        name: 'Test User'
      })
      .select()
      .single();

    if (profileError) {
      throw new Error(`Failed to create test profile: ${profileError.message}`);
    }

    // Create a general survey (not completed)
    const { data: survey, error: surveyError } = await supabase
      .from('general_surveys')
      .insert({
        user_id: testUserId,
        completed: false
      })
      .select()
      .single();

    if (surveyError) {
      throw new Error(`Failed to create test survey: ${surveyError.message}`);
    }

    generalSurveyId = survey.id;
  });

  afterAll(async () => {
    // Clean up test data
    await supabase.from('user_answers').delete().eq('user_id', testUserId);
    await supabase.from('specific_surveys').delete().eq('user_id', testUserId);
    await supabase.from('general_surveys').delete().eq('user_id', testUserId);
    await supabase.from('profiles').delete().eq('id', testUserId);
  });

  test('should block specific survey creation when general survey is not completed', async () => {
    // Try to create a specific survey without completing general survey
    const { data, error } = await supabase
      .from('specific_surveys')
      .insert({
        user_id: testUserId,
        general_survey_id: generalSurveyId,
        product_name: 'Test Product'
      })
      .select();

    // This should fail due to the guard constraint
    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });

  test('should allow specific survey creation when general survey is completed', async () => {
    // First, complete the general survey
    const { error: completeError } = await supabase
      .from('general_surveys')
      .update({
        completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', generalSurveyId)
      .eq('user_id', testUserId);

    expect(completeError).toBeNull();

    // Now try to create a specific survey
    const { data, error } = await supabase
      .from('specific_surveys')
      .insert({
        user_id: testUserId,
        general_survey_id: generalSurveyId,
        product_name: 'Test Product'
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data.product_name).toBe('Test Product');
  });

  test('should allow multiple specific surveys per user', async () => {
    const { data: survey1, error: error1 } = await supabase
      .from('specific_surveys')
      .insert({
        user_id: testUserId,
        general_survey_id: generalSurveyId,
        product_name: 'Product 1'
      })
      .select()
      .single();

    expect(error1).toBeNull();
    expect(survey1).toBeTruthy();

    const { data: survey2, error: error2 } = await supabase
      .from('specific_surveys')
      .insert({
        user_id: testUserId,
        general_survey_id: generalSurveyId,
        product_name: 'Product 2'
      })
      .select()
      .single();

    expect(error2).toBeNull();
    expect(survey2).toBeTruthy();
    expect(survey1.id).not.toBe(survey2.id);
  });

  test('should enforce user ownership of surveys', async () => {
    const otherUserId = 'other-user-' + Date.now();
    
    // Create another user
    await supabase
      .from('profiles')
      .insert({
        id: otherUserId,
        email: `other-${Date.now()}@example.com`,
        name: 'Other User'
      });

    // Try to create specific survey with wrong user ID
    const { data, error } = await supabase
      .from('specific_surveys')
      .insert({
        user_id: otherUserId, // Different user
        general_survey_id: generalSurveyId, // But same general survey
        product_name: 'Unauthorized Product'
      })
      .select();

    // This should fail due to foreign key constraint
    expect(error).toBeTruthy();
    expect(data).toBeNull();

    // Clean up
    await supabase.from('profiles').delete().eq('id', otherUserId);
  });

  test('should prevent creating specific survey with non-existent general survey', async () => {
    const { data, error } = await supabase
      .from('specific_surveys')
      .insert({
        user_id: testUserId,
        general_survey_id: 99999, // Non-existent ID
        product_name: 'Invalid Product'
      })
      .select();

    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });
});
