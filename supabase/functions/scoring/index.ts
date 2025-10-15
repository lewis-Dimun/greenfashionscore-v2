import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseClient, createSurvey, insertSurveyResponses, insertScore } from '../_shared/db.ts';
import { calculateCompleteSurveyScore } from '../_shared/engine.ts';

// Rate limiting (simple in-memory store for demo)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function rateLimitCheck(ip: string): boolean {
  const now = Date.now();
  const key = `scoring:${ip}`;
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (current.count >= 10) { // 10 requests per minute
    return false;
  }
  
  current.count++;
  return true;
}

serve(async (req) => {
  try {
    // Rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-client-ip') || 'anon';
    if (!rateLimitCheck(clientIp)) {
      return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request
    const body = await req.json();
    const { scope, product_type, answers } = body;

    // Validate required fields
    if (!scope || !answers || !Array.isArray(answers)) {
      return new Response(JSON.stringify({ error: 'Bad Request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (scope === 'product' && !product_type) {
      return new Response(JSON.stringify({ error: 'product_type required for product scope' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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

    // Create survey
    const survey = await createSurvey(supabase, {
      user_id: user.id,
      scope,
      product_type: product_type
    });

    // Insert survey responses
    await insertSurveyResponses(supabase, {
      survey_id: survey.id,
      responses: answers
    });

    // Calculate score
    const score = calculateCompleteSurveyScore(answers, scope, product_type);
    score.surveyId = survey.id;

    // Save score
    await insertScore(supabase, {
      survey_id: survey.id,
      score: {
        people: score.scores.people,
        planet: score.scores.planet,
        materials: score.scores.materials,
        circularity: score.scores.circularity,
        total: score.total,
        grade: score.grade
      }
    });

    return new Response(JSON.stringify({
      surveyId: survey.id,
      score: {
        people: score.scores.people,
        planet: score.scores.planet,
        materials: score.scores.materials,
        circularity: score.scores.circularity,
        total: score.total,
        grade: score.grade
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Scoring function error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});