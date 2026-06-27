import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const optionalNonEmptyString = z
  .string()
  .trim()
  .min(1)
  .optional()
  .nullable()
  .transform((value) => value ?? undefined);
const positiveOrderIndex = z.number().int().positive();

export const aiDifficultySchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);

export const aiRoadmapTaskSchema = z.object({
  order_index: positiveOrderIndex,
  title: nonEmptyString,
  description: nonEmptyString,
  estimated_time: optionalNonEmptyString,
});

export const aiRoadmapOutputSchema = z.object({
  title: nonEmptyString,
  description: nonEmptyString,
  difficulty: aiDifficultySchema,
  estimated_duration: nonEmptyString,
  tasks: z.array(aiRoadmapTaskSchema).min(1).max(12),
});

export const aiFlashcardSchema = z.object({
  order_index: positiveOrderIndex,
  front: nonEmptyString,
  back: nonEmptyString,
  topic: optionalNonEmptyString,
  difficulty: aiDifficultySchema,
});

export const aiFlashcardsOutputSchema = z.object({
  deck_title: nonEmptyString,
  topic: optionalNonEmptyString,
  flashcards: z.array(aiFlashcardSchema).min(1).max(50),
});

const quizOptionsSchema = z
  .array(nonEmptyString)
  .length(4)
  .superRefine((options, context) => {
    const normalized = options.map((option) => option.trim().toLowerCase());
    const unique = new Set(normalized);

    if (unique.size !== options.length) {
      context.addIssue({
        code: "custom",
        message: "Quiz options must be distinct.",
      });
    }
  });

export const aiQuizQuestionSchema = z
  .object({
    order_index: positiveOrderIndex,
    question: nonEmptyString,
    options: quizOptionsSchema,
    correct_answer: nonEmptyString,
    explanation: nonEmptyString,
    topic: optionalNonEmptyString,
    difficulty: aiDifficultySchema,
  })
  .superRefine((question, context) => {
    if (!question.options.includes(question.correct_answer)) {
      context.addIssue({
        code: "custom",
        path: ["correct_answer"],
        message: "Correct answer must exactly match one option.",
      });
    }
  });

export const aiQuizOutputSchema = z.object({
  quiz_title: nonEmptyString,
  topic: optionalNonEmptyString,
  difficulty: aiDifficultySchema,
  questions: z.array(aiQuizQuestionSchema).min(1).max(30),
});

export const aiInterviewQuestionSchema = z.object({
  order_index: positiveOrderIndex,
  question: nonEmptyString,
  expected_answer_points: z.array(nonEmptyString).min(1).max(8),
  difficulty: aiDifficultySchema,
  topic: optionalNonEmptyString,
});

export const aiInterviewQuestionsOutputSchema = z.object({
  session_title: nonEmptyString,
  topic: nonEmptyString,
  difficulty: aiDifficultySchema,
  questions: z.array(aiInterviewQuestionSchema).min(1).max(20),
});

export type AiDifficulty = z.infer<typeof aiDifficultySchema>;
export type AiRoadmapOutput = z.infer<typeof aiRoadmapOutputSchema>;
export type AiFlashcardsOutput = z.infer<typeof aiFlashcardsOutputSchema>;
export type AiQuizOutput = z.infer<typeof aiQuizOutputSchema>;
export type AiInterviewQuestionsOutput = z.infer<
  typeof aiInterviewQuestionsOutputSchema
>;