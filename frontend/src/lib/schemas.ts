import { z } from "zod";

// Shared schema for MCQ questions
export const MCQSchema = z.object({
  title: z.string(),
  difficulty: z.string().optional(),
  times_asked: z.union([z.string(), z.number()]).optional(),
  topic: z.string().optional(),
  company: z.string().optional(),
  description: z.string().optional(),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().optional(),
  explanation: z.string().optional(),
  hint: z.string().optional()
});

export const MCQResponseSchema = z.object({
  questions: z.array(MCQSchema)
});

// Shared schema for Subjective/Coding questions
export const SubjectiveSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string(),
  times_asked: z.union([z.string(), z.number()]).optional(),
  company: z.string().optional(),
  testcases: z.array(z.any()).optional()
});

export const SubjectiveResponseSchema = z.array(SubjectiveSchema);

export function validateResponse(data: any, isSubjective: boolean = true) {
  if (isSubjective) {
    return SubjectiveResponseSchema.parse(data);
  } else {
    // If it's an MCQ response, sometimes it returns the array directly, sometimes { questions: [...] }
    if (Array.isArray(data)) {
        return z.array(MCQSchema).parse(data);
    }
    return MCQResponseSchema.parse(data).questions;
  }
}
