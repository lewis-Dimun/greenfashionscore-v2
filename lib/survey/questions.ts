export interface SurveyQuestion {
  id: string;
  dimension: 'people' | 'planet' | 'materials' | 'circularity';
  question: string;
  type: 'single' | 'multiple' | 'scale';
  options: {
    value: string;
    label: string;
    points: number;
  }[];
  required: boolean;
}

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  // PEOPLE DIMENSION
  {
    id: 'people_1',
    dimension: 'people',
    question: '¿Tienes políticas escritas sobre condiciones laborales justas?',
    type: 'single',
    options: [
      { value: 'yes_comprehensive', label: 'Sí, políticas completas y auditadas', points: 10 },
      { value: 'yes_basic', label: 'Sí, políticas básicas', points: 6 },
      { value: 'partial', label: 'Algunas políticas', points: 3 },
      { value: 'no', label: 'No', points: 0 }
    ],
    required: true
  },
  {
    id: 'people_2',
    dimension: 'people',
    question: '¿Realizas auditorías laborales en tu cadena de suministro?',
    type: 'single',
    options: [
      { value: 'regular_third_party', label: 'Sí, auditorías regulares por terceros', points: 10 },
      { value: 'occasional', label: 'Ocasionalmente', points: 5 },
      { value: 'no', label: 'No', points: 0 }
    ],
    required: true
  },
  {
    id: 'people_3',
    dimension: 'people',
    question: '¿Pagar salarios dignos a todos los trabajadores?',
    type: 'single',
    options: [
      { value: 'yes_verified', label: 'Sí, verificado por auditorías', points: 10 },
      { value: 'yes_believe', label: 'Sí, creemos que sí', points: 5 },
      { value: 'no', label: 'No', points: 0 }
    ],
    required: true
  },

  // PLANET DIMENSION
  {
    id: 'planet_1',
    dimension: 'planet',
    question: '¿Mides tu huella de carbono?',
    type: 'single',
    options: [
      { value: 'yes_scope_3', label: 'Sí, incluyendo Scope 3 (cadena completa)', points: 10 },
      { value: 'yes_scope_1_2', label: 'Sí, Scope 1 y 2', points: 6 },
      { value: 'partial', label: 'Parcialmente', points: 3 },
      { value: 'no', label: 'No', points: 0 }
    ],
    required: true
  },
  {
    id: 'planet_2',
    dimension: 'planet',
    question: '¿Tienes objetivos de reducción de emisiones?',
    type: 'single',
    options: [
      { value: 'science_based', label: 'Sí, objetivos basados en ciencia (SBTi)', points: 10 },
      { value: 'internal', label: 'Sí, objetivos internos', points: 6 },
      { value: 'no', label: 'No', points: 0 }
    ],
    required: true
  },
  {
    id: 'planet_3',
    dimension: 'planet',
    question: '¿Usas energías renovables en tu producción?',
    type: 'single',
    options: [
      { value: '100_percent', label: '100% renovable', points: 10 },
      { value: 'partial', label: 'Parcialmente', points: 5 },
      { value: 'no', label: 'No', points: 0 }
    ],
    required: true
  },

  // MATERIALS DIMENSION
  {
    id: 'materials_1',
    dimension: 'materials',
    question: '¿Qué porcentaje de tus materiales son sostenibles?',
    type: 'single',
    options: [
      { value: '80_100', label: '80-100%', points: 10 },
      { value: '60_79', label: '60-79%', points: 8 },
      { value: '40_59', label: '40-59%', points: 6 },
      { value: '20_39', label: '20-39%', points: 4 },
      { value: '0_19', label: '0-19%', points: 2 },
      { value: 'unknown', label: 'No lo sé', points: 0 }
    ],
    required: true
  },
  {
    id: 'materials_2',
    dimension: 'materials',
    question: '¿Usas materiales orgánicos certificados?',
    type: 'single',
    options: [
      { value: 'yes_certified', label: 'Sí, con certificación (GOTS, etc.)', points: 10 },
      { value: 'yes_some', label: 'Sí, algunos productos', points: 6 },
      { value: 'no', label: 'No', points: 0 }
    ],
    required: true
  },
  {
    id: 'materials_3',
    dimension: 'materials',
    question: '¿Evitas químicos tóxicos en tu producción?',
    type: 'single',
    options: [
      { value: 'yes_certified', label: 'Sí, con certificación (OEKO-TEX, etc.)', points: 10 },
      { value: 'yes_basic', label: 'Sí, evitamos los más tóxicos', points: 6 },
      { value: 'no', label: 'No', points: 0 }
    ],
    required: true
  },

  // CIRCULARITY DIMENSION
  {
    id: 'circularity_1',
    dimension: 'circularity',
    question: '¿Diseñas tus productos para la durabilidad?',
    type: 'single',
    options: [
      { value: 'yes_comprehensive', label: 'Sí, diseño circular completo', points: 10 },
      { value: 'yes_basic', label: 'Sí, algunas características', points: 6 },
      { value: 'no', label: 'No', points: 0 }
    ],
    required: true
  },
  {
    id: 'circularity_2',
    dimension: 'circularity',
    question: '¿Ofreces servicios de reparación o reciclaje?',
    type: 'single',
    options: [
      { value: 'both', label: 'Sí, reparación y reciclaje', points: 10 },
      { value: 'repair', label: 'Solo reparación', points: 6 },
      { value: 'recycle', label: 'Solo reciclaje', points: 4 },
      { value: 'no', label: 'No', points: 0 }
    ],
    required: true
  },
  {
    id: 'circularity_3',
    dimension: 'circularity',
    question: '¿Usas materiales reciclados en tu producción?',
    type: 'single',
    options: [
      { value: 'high_percentage', label: 'Sí, más del 50%', points: 10 },
      { value: 'some', label: 'Sí, menos del 50%', points: 6 },
      { value: 'no', label: 'No', points: 0 }
    ],
    required: true
  }
];

export function getQuestionsByDimension(dimension: string): SurveyQuestion[] {
  return SURVEY_QUESTIONS.filter(q => q.dimension === dimension);
}

export function getQuestionById(id: string): SurveyQuestion | undefined {
  return SURVEY_QUESTIONS.find(q => q.id === id);
}
