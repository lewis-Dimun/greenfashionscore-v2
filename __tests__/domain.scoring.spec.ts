import { 
  computeRawCategorySum,
  normalizeCategory,
  computeDisplayTotal,
  gradeFromTotal,
  calculateSurveyScore,
  aggregateScores,
  calculateCompleteSurveyScore
} from "../lib/scoring/engine";

describe("Scoring engine (GFS)", () => {
  const DIMS = {
    PEOPLE: { max: 50, weight: 20 },
    PLANET: { max: 50, weight: 20 },
    CIRCULARITY: { max: 50, weight: 20 },
    MATERIALS: { max: 65, weight: 40 }
  };

  it("cap a prorrateo total cuando alcanza o supera el máximo", () => {
    expect(computeCategoryPercent(50, DIMS.PEOPLE.max, DIMS.PEOPLE.weight)).toBeCloseTo(20);
    expect(computeCategoryPercent(60, DIMS.PEOPLE.max, DIMS.PEOPLE.weight)).toBeCloseTo(20);
  });

  it("proporcionalidad correcta", () => {
    const pct = computeCategoryPercent(35, DIMS.PEOPLE.max, DIMS.PEOPLE.weight);
    expect(pct).toBeCloseTo(14);
  });

  it("total 0 cuando todos 0", () => {
    const total = computeTotalScore([
      computeCategoryPercent(0, DIMS.PEOPLE.max, DIMS.PEOPLE.weight),
      computeCategoryPercent(0, DIMS.PLANET.max, DIMS.PLANET.weight),
      computeCategoryPercent(0, DIMS.CIRCULARITY.max, DIMS.CIRCULARITY.weight),
      computeCategoryPercent(0, DIMS.MATERIALS.max, DIMS.MATERIALS.weight)
    ]);
    expect(total).toBeCloseTo(0);
    expect(gradeFromTotal(total)).toBe("E");
  });

  it("total 100 cuando todos en máximo", () => {
    const total = computeTotalScore([20, 20, 20, 40]);
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
    const general = 70;
    const specifics = [60, 80];
    const combined = combineGeneralAndSpecifics(general, specifics, {
      generalWeight: 0.6,
      specificsWeight: 0.4
    });
    expect(combined).toBeCloseTo(70);
  });

  it("edge cases: pesos inválidos o listas vacías", () => {
    expect(() => combineGeneralAndSpecifics(70, [], { generalWeight: 0.6, specificsWeight: 0.4 })).not.toThrow();
    const onlyGeneral = combineGeneralAndSpecifics(70, [], { generalWeight: 0.6, specificsWeight: 0.4 });
    expect(onlyGeneral).toBeCloseTo(70);
  });
});


