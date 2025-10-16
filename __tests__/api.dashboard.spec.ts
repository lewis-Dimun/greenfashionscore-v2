import { describe, it, expect, beforeEach } from '@jest/globals';
import { dashboardHandler, dashboardHandlerDeps } from '../supabase/functions/dashboard/handler';

describe('Dashboard Handler', () => {
  let mockDeps: ReturnType<typeof dashboardHandlerDeps>;

  beforeEach(() => {
    mockDeps = dashboardHandlerDeps({
      fetchUserSurveys: jest.fn()
    });
  });

  describe('GET /dashboard', () => {
    it('should return aggregated scores for user with general + product surveys', async () => {
      (mockDeps.fetchUserSurveys as any).mockResolvedValue([
        {
          surveyId: 'general-1',
          scope: 'general',
          scores: {
            people: 10,
            planet: 8,
            materials: 20,
            circularity: 5,
            total: 43,
            grade: 'C'
          }
        },
        {
          surveyId: 'product-1',
          scope: 'product',
          productType: 'camiseta',
          scores: {
            people: 5,
            planet: 3,
            materials: 10,
            circularity: 2,
            total: 20,
            grade: 'D'
          }
        },
        {
          surveyId: 'product-2',
          scope: 'product',
          productType: 'pantalon',
          scores: {
            people: 3,
            planet: 2,
            materials: 8,
            circularity: 1,
            total: 14,
            grade: 'D'
          }
        }
      ]);

      const handler = dashboardHandler(mockDeps);
      
      const request = new Request('http://localhost/dashboard');
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.people).toBe(18); // 10 + 5 + 3, capped at 20
      expect(data.planet).toBe(13); // 8 + 3 + 2, capped at 20
      expect(data.materials).toBe(38); // 20 + 10 + 8, capped at 40
      expect(data.circularity).toBe(8); // 5 + 2 + 1, capped at 20
      expect(data.total).toBe(77); // 18 + 13 + 38 + 8
      expect(data.grade).toBe('A');
      expect(data.breakdown).toHaveLength(3);
      expect(data.breakdown[0].scope).toBe('general');
      expect(data.breakdown[1].scope).toBe('product');
      expect(data.breakdown[2].scope).toBe('product');

      expect(mockDeps.fetchUserSurveys).toHaveBeenCalledWith({
        userId: 'user-id-from-jwt'
      });
    });

    it('should return empty scores when user has no surveys', async () => {
      (mockDeps.fetchUserSurveys as any).mockResolvedValue([]);

      const handler = dashboardHandler(mockDeps);
      
      const request = new Request('http://localhost/dashboard');
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.people).toBe(0);
      expect(data.planet).toBe(0);
      expect(data.materials).toBe(0);
      expect(data.circularity).toBe(0);
      expect(data.total).toBe(0);
      expect(data.grade).toBe('E');
      expect(data.breakdown).toHaveLength(0);
    });

    it('should return empty scores when user has no general survey', async () => {
      (mockDeps.fetchUserSurveys as any).mockResolvedValue([
        {
          surveyId: 'product-1',
          scope: 'product',
          productType: 'camiseta',
          scores: {
            people: 5,
            planet: 3,
            materials: 10,
            circularity: 2,
            total: 20,
            grade: 'D'
          }
        }
      ]);

      const handler = dashboardHandler(mockDeps);
      
      const request = new Request('http://localhost/dashboard');
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.people).toBe(0);
      expect(data.planet).toBe(0);
      expect(data.materials).toBe(0);
      expect(data.circularity).toBe(0);
      expect(data.total).toBe(0);
      expect(data.grade).toBe('E');
      expect(data.breakdown).toHaveLength(1);
    });

    it('should handle only general survey', async () => {
      (mockDeps.fetchUserSurveys as any).mockResolvedValue([
        {
          surveyId: 'general-1',
          scope: 'general',
          scores: {
            people: 15,
            planet: 12,
            materials: 25,
            circularity: 8,
            total: 60,
            grade: 'B'
          }
        }
      ]);

      const handler = dashboardHandler(mockDeps);
      
      const request = new Request('http://localhost/dashboard');
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.people).toBe(15);
      expect(data.planet).toBe(12);
      expect(data.materials).toBe(25);
      expect(data.circularity).toBe(8);
      expect(data.total).toBe(60);
      expect(data.grade).toBe('B');
      expect(data.breakdown).toHaveLength(1);
    });

    it('should respect category caps when aggregating', async () => {
      (mockDeps.fetchUserSurveys as any).mockResolvedValue([
        {
          surveyId: 'general-1',
          scope: 'general',
          scores: {
            people: 18,
            planet: 15,
            materials: 35,
            circularity: 15,
            total: 83,
            grade: 'A'
          }
        },
        {
          surveyId: 'product-1',
          scope: 'product',
          productType: 'camiseta',
          scores: {
            people: 5,
            planet: 8,
            materials: 10,
            circularity: 8,
            total: 31,
            grade: 'C'
          }
        }
      ]);

      const handler = dashboardHandler(mockDeps);
      
      const request = new Request('http://localhost/dashboard');
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.people).toBe(20); // 18 + 5 = 23, capped at 20
      expect(data.planet).toBe(20); // 15 + 8 = 23, capped at 20
      expect(data.materials).toBe(40); // 35 + 10 = 45, capped at 40
      expect(data.circularity).toBe(20); // 15 + 8 = 23, capped at 20
    });

    it('should handle ETag caching', async () => {
      const mockData = [
        {
          surveyId: 'general-1',
          scope: 'general',
          scores: {
            people: 10,
            planet: 8,
            materials: 20,
            circularity: 5,
            total: 43,
            grade: 'C'
          }
        }
      ];
      
      (mockDeps.fetchUserSurveys as any).mockResolvedValue(mockData);

      const handler = dashboardHandler(mockDeps);
      
      // First request
      const request1 = new Request('http://localhost/dashboard');
      const response1 = await handler(request1);
      const data1 = await response1.json();
      const etag = response1.headers.get('ETag');

      expect(response1.status).toBe(200);
      expect(etag).toBeTruthy();

      // Second request with matching ETag
      const request2 = new Request('http://localhost/dashboard', {
        headers: { 'if-none-match': etag! }
      });
      const response2 = await handler(request2);

      expect(response2.status).toBe(304);
    });

    it('should handle database errors', async () => {
      (mockDeps.fetchUserSurveys as any).mockRejectedValue(new Error('DB Error'));

      const handler = dashboardHandler(mockDeps);
      
      const request = new Request('http://localhost/dashboard');
      const response = await handler(request);

      expect(response.status).toBe(500);
    });
  });

  describe('Score aggregation logic', () => {
    it('should correctly aggregate multiple product surveys', async () => {
      (mockDeps.fetchUserSurveys as any).mockResolvedValue([
        {
          surveyId: 'general-1',
          scope: 'general',
          scores: {
            people: 8,
            planet: 6,
            materials: 15,
            circularity: 4,
            total: 33,
            grade: 'C'
          }
        },
        {
          surveyId: 'product-1',
          scope: 'product',
          productType: 'camiseta',
          scores: {
            people: 3,
            planet: 2,
            materials: 8,
            circularity: 1,
            total: 14,
            grade: 'D'
          }
        },
        {
          surveyId: 'product-2',
          scope: 'product',
          productType: 'pantalon',
          scores: {
            people: 2,
            planet: 1,
            materials: 5,
            circularity: 1,
            total: 9,
            grade: 'D'
          }
        },
        {
          surveyId: 'product-3',
          scope: 'product',
          productType: 'vestido',
          scores: {
            people: 4,
            planet: 3,
            materials: 12,
            circularity: 2,
            total: 21,
            grade: 'D'
          }
        }
      ]);

      const handler = dashboardHandler(mockDeps);
      
      const request = new Request('http://localhost/dashboard');
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.people).toBe(17); // 8 + 3 + 2 + 4
      expect(data.planet).toBe(12); // 6 + 2 + 1 + 3
      expect(data.materials).toBe(40); // 15 + 8 + 5 + 12 = 40, capped at 40
      expect(data.circularity).toBe(8); // 4 + 1 + 1 + 2
      expect(data.total).toBe(77); // 17 + 12 + 40 + 8
      expect(data.grade).toBe('A');
    });
  });
});