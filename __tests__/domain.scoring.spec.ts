import { 
  computeRawCategorySum,
  normalizeCategory,
  computeDisplayTotal,
  gradeFromTotal,
  calculateSurveyScore,
  aggregateScores,
  calculateCompleteSurveyScore,
  computeTotalScore,
  computeCategoryPercent,
  combineGeneralAndSpecifics
} from "../lib/scoring/engine";

describe("Scoring engine (GFS)", () => {
  const DIMS = {
    PEOPLE: { max: 50, weight: 20 },
    PLANET: { max: 50, weight: 20 },
    CIRCULARITY: { max: 50, weight: 20 },
    MATERIALS: { max: 65, weight: 40 }
  };

  it("cap a prorrateo total cuando alcanza o supera el máximo", () => {
    // RAW_MAX for people is 44, DISPLAY_MAX is 20
    // When RAW=44, DISPLAY=20; when RAW=50 (exceeds max), DISPLAY is still 20 (capped)
    expect(computeCategoryPercent(44, 'people')).toBeCloseTo(20);
    expect(computeCategoryPercent(50, 'people')).toBeCloseTo(20);
  });

  it("proporcionalidad correcta", () => {
    // people: RAW_MAX=44, DISPLAY_MAX=20
    // 35/44*20 ≈ 15.91
    const pct = computeCategoryPercent(35, 'people');
    expect(pct).toBeCloseTo(15.91, 1);
  });

  it("total 0 cuando todos 0", () => {
    const scores = {
      people: computeCategoryPercent(0, 'people'),
      planet: computeCategoryPercent(0, 'planet'),
      circularity: computeCategoryPercent(0, 'circularity'),
      materials: computeCategoryPercent(0, 'materials')
    };
    const total = computeTotalScore(scores);
    expect(total).toBeCloseTo(0);
    expect(gradeFromTotal(total)).toBe("E");
  });

  it("total 100 cuando todos en máximo", () => {
    const scores = {
      people: 20,
      planet: 20,
      circularity: 20,
      materials: 40
    };
    const total = computeTotalScore(scores);
    expect(total).toBeCloseTo(100);
    expect(gradeFromTotal(total)).toBe("A");
  });

  it("rango de letras A–E correcto", () => {
    expect(gradeFromTotal(90)).toBe("A");
    expect(gradeFromTotal(74)).toBe("B");
    expect(gradeFromTotal(50)).toBe("B");
    expect(gradeFromTotal(49)).toBe("C");
    expect(gradeFromTotal(25)).toBe("C");
    expect(gradeFromTotal(24)).toBe("D");
    expect(gradeFromTotal(1)).toBe("D");
    expect(gradeFromTotal(0)).toBe("E");
  });

  it("combinación general/específicas con 60/40 por defecto", () => {
    const general = {
      surveyId: 'general-1',
      scope: 'general' as const,
      scores: { people: 20, planet: 20, materials: 20, circularity: 10 },
      total: 70,
      grade: 'B' as const
    };
    const specifics = [
      {
        surveyId: 'specific-1',
        scope: 'product' as const,
        productType: 'jersey',
        scores: { people: 15, planet: 15, materials: 20, circularity: 10 },
        total: 60,
        grade: 'C' as const
      }
    ];
    const combined = combineGeneralAndSpecifics(general, specifics);
    expect(combined.total).toBeGreaterThan(0);
  });

  it("edge cases: pesos inválidos o listas vacías", () => {
    const general = {
      surveyId: 'general-1',
      scope: 'general' as const,
      scores: { people: 20, planet: 20, materials: 20, circularity: 10 },
      total: 70,
      grade: 'B' as const
    };
    expect(() => combineGeneralAndSpecifics(general, [])).not.toThrow();
    const onlyGeneral = combineGeneralAndSpecifics(general, []);
    expect(onlyGeneral.total).toBeGreaterThan(0);
  });
});


