export type AnswerInput = { question_code: string; answer_code: string };

export function mapAnswersToPoints(_answers: AnswerInput[]): { [questionCode: string]: number } {
  // TODO: use answers_catalog mapping once DB wired
  return {};
}


