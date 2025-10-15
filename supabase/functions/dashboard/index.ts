import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseClient, fetchUserSurveys } from '../_shared/db.ts';
import { aggregateScores } from '../_shared/engine.ts';

serve(async (req) => {
  try {
    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createSupabaseClient();
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch all user surveys with scores
    const surveys = await fetchUserSurveys(supabase, user.id);

    if (surveys.length === 0) {
      return new Response(JSON.stringify({
        people: 0,
        planet: 0,
        materials: 0,
        circularity: 0,
        total: 0,
        grade: 'E',
        breakdown: []
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Separate general and product surveys
    const generalSurvey = surveys.find(s => s.scope === 'general');
    const productSurveys = surveys.filter(s => s.scope === 'product');

    if (!generalSurvey) {
      return new Response(JSON.stringify({
        people: 0,
        planet: 0,
        materials: 0,
        circularity: 0,
        total: 0,
        grade: 'E',
        breakdown: surveys
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Convert to SurveyScore format for aggregation
    const generalScore = {
      surveyId: generalSurvey.id,
      scope: 'general' as const,
      scores: generalSurvey.scores,
      total: generalSurvey.scores.total,
      grade: generalSurvey.scores.grade as 'A' | 'B' | 'C' | 'D' | 'E'
    };

    const productScores = productSurveys.map(survey => ({
      surveyId: survey.id,
      scope: 'product' as const,
      productType: survey.product_type,
      scores: survey.scores,
      total: survey.scores.total,
      grade: survey.scores.grade as 'A' | 'B' | 'C' | 'D' | 'E'
    }));

    // Aggregate scores
    const aggregated = aggregateScores(generalScore, productScores);

    // Generate ETag based on last survey update
    const etag = `"${Date.now()}"`;

    // Check for ETag match
    const ifNoneMatch = req.headers.get('if-none-match');
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new Response(null, { 
        status: 304, 
        headers: { ETag: etag } 
      });
    }

    return new Response(JSON.stringify(aggregated), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        ETag: etag
      }
    });

  } catch (error) {
    console.error('Dashboard function error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});