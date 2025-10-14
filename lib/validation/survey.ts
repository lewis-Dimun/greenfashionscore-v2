import { z } from "zod";

export const surveyAnswerSchema = z.record(z.string(), z.string().min(1));

export function isSurveyValid(answers: Record<string, string>): boolean {
  const res = surveyAnswerSchema.safeParse(answers);
  return res.success;
}


