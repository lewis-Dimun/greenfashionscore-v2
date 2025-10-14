export type AnswerInput = { question_code: string; answer_code: string };

export function mapAnswersToPoints(_answers: AnswerInput[]): { [questionCode: string]: number } {
  // Placeholder mapping; once catalog is available, fetch from DB inside function
  return {};
}


