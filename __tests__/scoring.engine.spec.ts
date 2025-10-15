import { describe, it, expect } from '@jest/globals';
import {
  computeCategoryScore,
  computeTotalScore,
  gradeFromTotal,
  aggregateScores,
  calculateCompleteSurveyScore,
  type CategoryScores,
  type SurveyScore
} from '../lib/scoring/engine';

describe('Scoring Engine', () => {
  describe('computeCategoryScore', () => {
    it('should calculate category score with cap', () => {
      // People: max 20
      expect(computeCategoryScore([5, 10, 8], 'people')).toBe(20); // Capped at 20
      expect(computeCategoryScore([5, 10], 'people')).toBe(15); // Not capped
      
      // Materials: max 40
      expect(computeCategoryScore([20, 25], 'materials')).toBe(40); // Capped at 40
      expect(computeCategoryScore([10, 15], 'materials')).toBe(25); // Not capped
    });

    it('should handle empty scores array', () => {
      expect(computeCategoryScore([], 'people')).toBe(0);
      expect(computeCategoryScore([], 'materials')).toBe(0);
    });

    it('should handle negative scores', () => {
      expect(computeCategoryScore([-5, 10], 'people')).toBe(5);
    });
  });

  describe('computeTotalScore', () => {
    it('should calculate total score with cap', () => {
      const scores: CategoryScores = {
        people: 20,
        planet: 20,
        materials: 40,
        circularity: 20
      };
      expect(computeTotalScore(scores)).toBe(100); // Max total
    });

    it('should cap total at 100', () => {
      const scores: CategoryScores = {
        people: 25, // Over cap
        planet: 25, // Over cap
        materials: 50, // Over cap
        circularity: 25 // Over cap
      };
      expect(computeTotalScore(scores)).toBe(100); // Capped at 100
    });

    it('should handle partial scores', () => {
      const scores: CategoryScores = {
        people: 10,
        planet: 5,
        materials: 20,
        circularity: 8
      };
      expect(computeTotalScore(scores)).toBe(43);
    });
  });

  describe('gradeFromTotal', () => {
    it('should assign correct grades', () => {
      expect(gradeFromTotal(100)).toBe('A');
      expect(gradeFromTotal(90)).toBe('A');
      expect(gradeFromTotal(75)).toBe('A');
      expect(gradeFromTotal(74)).toBe('B');
      expect(gradeFromTotal(50)).toBe('B');
      expect(gradeFromTotal(49)).toBe('C');
      expect(gradeFromTotal(25)).toBe('C');
      expect(gradeFromTotal(24)).toBe('D');
      expect(gradeFromTotal(1)).toBe('D');
      expect(gradeFromTotal(0)).toBe('E');
    });
  });

  describe('aggregateScores', () => {
    it('should aggregate general + product scores', () => {
      const generalScore: SurveyScore = {
        surveyId: 'general-1',
        scope: 'general',
        scores: { people: 10, planet: 8, materials: 20, circularity: 5 },
        total: 43,
        grade: 'C'
      };

      const productScores: SurveyScore[] = [
        {
          surveyId: 'product-1',
          scope: 'product',
          productType: 'camiseta',
          scores: { people: 5, planet: 3, materials: 10, circularity: 2 },
          total: 20,
          grade: 'D'
        },
        {
          surveyId: 'product-2',
          scope: 'product',
          productType: 'pantalon',
          scores: { people: 3, planet: 2, materials: 8, circularity: 1 },
          total: 14,
          grade: 'D'
        }
      ];

      const result = aggregateScores(generalScore, productScores);

      expect(result.people).toBe(18); // 10 + 5 + 3, capped at 20
      expect(result.planet).toBe(13); // 8 + 3 + 2, capped at 20
      expect(result.materials).toBe(38); // 20 + 10 + 8, capped at 40
      expect(result.circularity).toBe(8); // 5 + 2 + 1, capped at 20
      expect(result.total).toBe(77); // 18 + 13 + 38 + 8
      expect(result.grade).toBe('A');
      expect(result.breakdown).toHaveLength(3);
    });

    it('should handle only general score', () => {
      const generalScore: SurveyScore = {
        surveyId: 'general-1',
        scope: 'general',
        scores: { people: 15, planet: 12, materials: 25, circularity: 8 },
        total: 60,
        grade: 'B'
      };

      const result = aggregateScores(generalScore, []);

      expect(result.people).toBe(15);
      expect(result.planet).toBe(12);
      expect(result.materials).toBe(25);
      expect(result.circularity).toBe(8);
      expect(result.total).toBe(60);
      expect(result.grade).toBe('B');
      expect(result.breakdown).toHaveLength(1);
    });

    it('should respect category caps when aggregating', () => {
      const generalScore: SurveyScore = {
        surveyId: 'general-1',
        scope: 'general',
        scores: { people: 18, planet: 15, materials: 35, circularity: 15 },
        total: 83,
        grade: 'A'
      };

      const productScores: SurveyScore[] = [
        {
          surveyId: 'product-1',
          scope: 'product',
          productType: 'camiseta',
          scores: { people: 5, planet: 8, materials: 10, circularity: 8 },
          total: 31,
          grade: 'C'
        }
      ];

      const result = aggregateScores(generalScore, productScores);

      expect(result.people).toBe(20); // 18 + 5 = 23, capped at 20
      expect(result.planet).toBe(20); // 15 + 8 = 23, capped at 20
      expect(result.materials).toBe(40); // 35 + 10 = 45, capped at 40
      expect(result.circularity).toBe(20); // 15 + 8 = 23, capped at 20
    });
  });

  describe('calculateCompleteSurveyScore', () => {
    it('should calculate score for general survey', () => {
      const responses = [
        { questionId: 'people_q1', answerId: 'people_q1_a1', numericValue: 5 },
        { questionId: 'people_q2', answerId: 'people_q2_a1', numericValue: 3 },
        { questionId: 'planet_q1', answerId: 'planet_q1_a1', numericValue: 4 },
        { questionId: 'materials_q1', answerId: 'materials_q1_a1', numericValue: 8 },
        { questionId: 'materials_q2', answerId: 'materials_q2_a1', numericValue: 6 },
        { questionId: 'circularity_q1', answerId: 'circularity_q1_a1', numericValue: 2 }
      ];

      const result = calculateCompleteSurveyScore(responses, 'general');

      expect(result.scope).toBe('general');
      expect(result.scores.people).toBe(8); // 5 + 3
      expect(result.scores.planet).toBe(4);
      expect(result.scores.materials).toBe(14); // 8 + 6
      expect(result.scores.circularity).toBe(2);
      expect(result.total).toBe(28);
      expect(result.grade).toBe('C');
    });

    it('should calculate score for product survey', () => {
      const responses = [
        { questionId: 'people_q1', answerId: 'people_q1_a1', numericValue: 2 },
        { questionId: 'planet_q1', answerId: 'planet_q1_a1', numericValue: 3 },
        { questionId: 'materials_q1', answerId: 'materials_q1_a1', numericValue: 5 }
      ];

      const result = calculateCompleteSurveyScore(responses, 'product', 'camiseta');

      expect(result.scope).toBe('product');
      expect(result.productType).toBe('camiseta');
      expect(result.scores.people).toBe(2);
      expect(result.scores.planet).toBe(3);
      expect(result.scores.materials).toBe(5);
      expect(result.scores.circularity).toBe(0);
      expect(result.total).toBe(10);
      expect(result.grade).toBe('D');
    });

    it('should handle responses that exceed category caps', () => {
      const responses = [
        { questionId: 'people_q1', answerId: 'people_q1_a1', numericValue: 15 },
        { questionId: 'people_q2', answerId: 'people_q2_a1', numericValue: 10 }, // Total 25, capped at 20
        { questionId: 'materials_q1', answerId: 'materials_q1_a1', numericValue: 30 },
        { questionId: 'materials_q2', answerId: 'materials_q2_a1', numericValue: 15 } // Total 45, capped at 40
      ];

      const result = calculateCompleteSurveyScore(responses, 'general');

      expect(result.scores.people).toBe(20); // Capped
      expect(result.scores.materials).toBe(40); // Capped
      expect(result.total).toBe(60); // 20 + 0 + 40 + 0
    });
  });

  describe('Edge cases', () => {
    it('should handle zero scores', () => {
      const scores: CategoryScores = {
        people: 0,
        planet: 0,
        materials: 0,
        circularity: 0
      };
      expect(computeTotalScore(scores)).toBe(0);
      expect(gradeFromTotal(0)).toBe('E');
    });

    it('should handle very high scores', () => {
      const scores: CategoryScores = {
        people: 50, // Way over cap
        planet: 50, // Way over cap
        materials: 100, // Way over cap
        circularity: 50 // Way over cap
      };
      expect(computeTotalScore(scores)).toBe(100); // Capped at 100
    });
  });
});

