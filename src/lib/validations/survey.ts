import { z } from "zod";

export const surveySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  frequency: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]),
  triggerDate: z.number().min(1).max(31),
  clientId: z.string().min(1, "Client is required"),
  teamMemberId: z.string().min(1, "Team member is required"),
  questions: z.array(
    z.object({
      text: z.string().min(1, "Question text is required"),
      type: z.enum(["TEXT", "NUMBER", "RATING", "BOOLEAN", "MULTIPLE_CHOICE"]),
      required: z.boolean().default(true),
      order: z.number().min(0),
    })
  ),
});

export const responseSchema = z.object({
  surveyId: z.string().min(1, "Survey ID is required"),
  score: z.number().min(0).max(10).optional(),
  answers: z.array(
    z.object({
      questionId: z.string().min(1, "Question ID is required"),
      text: z.string().optional(),
      score: z.number().min(0).max(10).optional(),
    })
  ),
}); 