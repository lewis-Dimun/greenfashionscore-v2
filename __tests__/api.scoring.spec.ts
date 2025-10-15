import { describe, it, expect, beforeEach } from '@jest/globals';
import { scoringHandler, scoringHandlerDeps } from '../supabase/functions/scoring/handler';

describe('Scoring Handler', () => {
  let mockDeps: ReturnType<typeof scoringHandlerDeps>;

  beforeEach(() => {
    mockDeps = scoringHandlerDeps({
      createSurvey: jest.fn().mockResolvedValue({ surveyId: 'survey-123' }),
      insertSurveyResponses: jest.fn().mockResolvedValue(undefined),
      insertScore: jest.fn().mockResolvedValue(undefined),
      invalidateDashboard: jest.fn().mockResolvedValue(undefined)
    });
  });

  describe('POST /submissions', () => {
    it('should process general survey submission', async () => {
      const handler = scoringHandler(mockDeps);
      
      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: 'general',
          answers: [
            { questionId: 'people_q1', answerId: 'people_q1_a1', numericValue: 5 },
            { questionId: 'planet_q1', answerId: 'planet_q1_a1', numericValue: 3 },
            { questionId: 'materials_q1', answerId: 'materials_q1_a1', numericValue: 8 },
            { questionId: 'circularity_q1', answerId: 'circularity_q1_a1', numericValue: 2 }
          ]
        })
      });

      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.surveyId).toBe('survey-123');
      expect(data.score).toHaveProperty('people');
      expect(data.score).toHaveProperty('planet');
      expect(data.score).toHaveProperty('materials');
      expect(data.score).toHaveProperty('circularity');
      expect(data.score).toHaveProperty('total');
      expect(data.score).toHaveProperty('grade');

      expect(mockDeps.createSurvey).toHaveBeenCalledWith({
        userId: 'user-id-from-jwt',
        scope: 'general'
      });
      expect(mockDeps.insertSurveyResponses).toHaveBeenCalledWith({
        surveyId: 'survey-123',
        responses: expect.any(Array)
      });
      expect(mockDeps.insertScore).toHaveBeenCalledWith({
        surveyId: 'survey-123',
        score: expect.objectContaining({
          scope: 'general',
          scores: expect.any(Object),
          total: expect.any(Number),
          grade: expect.any(String)
        })
      });
    });

    it('should process product survey submission', async () => {
      const handler = scoringHandler(mockDeps);
      
      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: 'product',
          product_type: 'camiseta',
          answers: [
            { questionId: 'people_q1', answerId: 'people_q1_a1', numericValue: 3 },
            { questionId: 'materials_q1', answerId: 'materials_q1_a1', numericValue: 5 }
          ]
        })
      });

      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.surveyId).toBe('survey-123');

      expect(mockDeps.createSurvey).toHaveBeenCalledWith({
        userId: 'user-id-from-jwt',
        scope: 'product',
        productType: 'camiseta'
      });
    });

    it('should validate request payload', async () => {
      const handler = scoringHandler(mockDeps);
      
      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: 'invalid',
          answers: []
        })
      });

      const response = await handler(request);
      expect(response.status).toBe(400);
    });

    it('should handle missing answers', async () => {
      const handler = scoringHandler(mockDeps);
      
      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: 'general'
        })
      });

      const response = await handler(request);
      expect(response.status).toBe(400);
    });

    it('should handle invalid JSON', async () => {
      const handler = scoringHandler(mockDeps);
      
      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });

      const response = await handler(request);
      expect(response.status).toBe(500);
    });

    it('should handle database errors', async () => {
      const errorDeps = scoringHandlerDeps({
        createSurvey: jest.fn().mockRejectedValue(new Error('DB Error')),
        insertSurveyResponses: jest.fn().mockResolvedValue(undefined),
        insertScore: jest.fn().mockResolvedValue(undefined)
      });

      const handler = scoringHandler(errorDeps);
      
      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: 'general',
          answers: [
            { questionId: 'people_q1', answerId: 'people_q1_a1', numericValue: 5 }
          ]
        })
      });

      const response = await handler(request);
      expect(response.status).toBe(500);
    });
  });

  describe('Rate limiting', () => {
    it('should handle rate limiting', async () => {
      // Mock rate limiting to return false
      const mockRateLimitCheck = jest.fn().mockResolvedValue({ allowed: false });
      jest.doMock('../supabase/functions/_shared/utils', () => ({
        rateLimitCheck: mockRateLimitCheck,
        errorResponse: jest.fn().mockReturnValue(new Response(null, { status: 429 })),
        jsonResponse: jest.fn()
      }));

      const handler = scoringHandler(mockDeps);
      
      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: 'general',
          answers: []
        })
      });

      const response = await handler(request);
      expect(response.status).toBe(429);
    });
  });

  describe('Score calculation', () => {
    it('should calculate correct scores for different categories', async () => {
      const handler = scoringHandler(mockDeps);
      
      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: 'general',
          answers: [
            { questionId: 'people_q1', answerId: 'people_q1_a1', numericValue: 10 },
            { questionId: 'people_q2', answerId: 'people_q2_a1', numericValue: 8 }, // Total: 18
            { questionId: 'planet_q1', answerId: 'planet_q1_a1', numericValue: 5 },
            { questionId: 'materials_q1', answerId: 'materials_q1_a1', numericValue: 20 },
            { questionId: 'materials_q2', answerId: 'materials_q2_a1', numericValue: 15 }, // Total: 35
            { questionId: 'circularity_q1', answerId: 'circularity_q1_a1', numericValue: 3 }
          ]
        })
      });

      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.score.people).toBe(18); // 10 + 8, not capped
      expect(data.score.planet).toBe(5);
      expect(data.score.materials).toBe(35); // 20 + 15, not capped
      expect(data.score.circularity).toBe(3);
      expect(data.score.total).toBe(61); // 18 + 5 + 35 + 3
    });

    it('should apply category caps correctly', async () => {
      const handler = scoringHandler(mockDeps);
      
      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: 'general',
          answers: [
            { questionId: 'people_q1', answerId: 'people_q1_a1', numericValue: 15 },
            { questionId: 'people_q2', answerId: 'people_q2_a1', numericValue: 10 }, // Total: 25, capped at 20
            { questionId: 'materials_q1', answerId: 'materials_q1_a1', numericValue: 30 },
            { questionId: 'materials_q2', answerId: 'materials_q2_a1', numericValue: 20 } // Total: 50, capped at 40
          ]
        })
      });

      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.score.people).toBe(20); // Capped at 20
      expect(data.score.materials).toBe(40); // Capped at 40
    });
  });
});