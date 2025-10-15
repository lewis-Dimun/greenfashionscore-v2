export type Question = {
  id: string;
  scope: 'general' | 'product';
  category: 'people' | 'planet' | 'materials' | 'circularity';
  text: string;
  excel_id: string;
  order: number;
  weight?: number;
  answers: Answer[];
};

export type Answer = {
  id: string;
  question_id?: string;
  answer_code: string;
  text: string;
  numeric_value: number;
  order: number;
};

export function getFallbackQuestions(): Record<string, Question[]> {
  return {
    people: [
      {
        id: 'people_q1',
        scope: 'general',
        category: 'people',
        text: '¿Su empresa tiene una política de derechos humanos y laborales que cubre a toda su cadena de suministro?',
        excel_id: '1',
        order: 1,
        weight: 4,
        answers: [
          { id: 'people_q1_a1', question_id: 'people_q1', answer_code: '1', text: 'Sí, documentada y auditada regularmente', numeric_value: 5, order: 1 },
          { id: 'people_q1_a2', question_id: 'people_q1', answer_code: '2', text: 'Sí, documentada pero no auditada regularmente', numeric_value: 3, order: 2 },
          { id: 'people_q1_a3', question_id: 'people_q1', answer_code: '3', text: 'No, pero estamos trabajando en ello', numeric_value: 1, order: 3 },
          { id: 'people_q1_a4', question_id: 'people_q1', answer_code: '4', text: 'No', numeric_value: 0, order: 4 },
        ],
      },
    ],
    planet: [
      {
        id: 'planet_q1',
        scope: 'general',
        category: 'planet',
        text: '¿Miden y reportan sus emisiones de gases de efecto invernadero (GEI) en toda su cadena de valor?',
        excel_id: '2',
        order: 1,
        weight: 4,
        answers: [
          { id: 'planet_q1_a1', question_id: 'planet_q1', answer_code: '1', text: 'Sí, Scope 1, 2 y 3, con verificación externa', numeric_value: 5, order: 1 },
          { id: 'planet_q1_a2', question_id: 'planet_q1', answer_code: '2', text: 'Sí, Scope 1 y 2', numeric_value: 3, order: 2 },
          { id: 'planet_q1_a3', question_id: 'planet_q1', answer_code: '3', text: 'Estamos empezando a medir Scope 1 y 2', numeric_value: 1, order: 3 },
          { id: 'planet_q1_a4', question_id: 'planet_q1', answer_code: '4', text: 'No', numeric_value: 0, order: 4 },
        ],
      },
    ],
    materials: [
      {
        id: 'materials_q1',
        scope: 'general',
        category: 'materials',
        text: '¿Qué porcentaje de los materiales que utilizan son sostenibles (orgánicos, reciclados, certificados)?',
        excel_id: '3',
        order: 1,
        weight: 10,
        answers: [
          { id: 'materials_q1_a1', question_id: 'materials_q1', answer_code: '1', text: 'Más del 75%', numeric_value: 10, order: 1 },
          { id: 'materials_q1_a2', question_id: 'materials_q1', answer_code: '2', text: 'Entre 25% y 75%', numeric_value: 6, order: 2 },
          { id: 'materials_q1_a3', question_id: 'materials_q1', answer_code: '3', text: 'Menos del 25%', numeric_value: 2, order: 3 },
          { id: 'materials_q1_a4', question_id: 'materials_q1', answer_code: '4', text: 'Ninguno o muy poco', numeric_value: 0, order: 4 },
        ],
      },
    ],
    circularity: [
      {
        id: 'circularity_q1',
        scope: 'general',
        category: 'circularity',
        text: '¿Sus productos están diseñados para ser duraderos y reparables?',
        excel_id: '4',
        order: 1,
        weight: 5,
        answers: [
          { id: 'circularity_q1_a1', question_id: 'circularity_q1', answer_code: '1', text: 'Sí, el diseño y los materiales priorizan la durabilidad y ofrecemos servicios de reparación', numeric_value: 5, order: 1 },
          { id: 'circularity_q1_a2', question_id: 'circularity_q1', answer_code: '2', text: 'Sí, el diseño prioriza la durabilidad', numeric_value: 3, order: 2 },
          { id: 'circularity_q1_a3', question_id: 'circularity_q1', answer_code: '3', text: 'No es una prioridad principal', numeric_value: 1, order: 3 },
          { id: 'circularity_q1_a4', question_id: 'circularity_q1', answer_code: '4', text: 'No', numeric_value: 0, order: 4 },
        ],
      },
    ],
  };
}



