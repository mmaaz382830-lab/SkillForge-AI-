import type { AiDifficulty } from "@/lib/ai/schemas";

const MAX_MATERIAL_CONTEXT_CHARS = 12_000;

// Answer feedback only needs compact question context; keep it much smaller than material prompts.
const MAX_INTERVIEW_ANSWER_CHARS = 8_000;

type BasePromptInput = {
  difficulty?: AiDifficulty;
  materialContext?: string;
};

export type RoadmapPromptInput = BasePromptInput & {
  goalTitle?: string;
  topic?: string;
  targetDuration?: string;
  taskCount?: number;
};

export type FlashcardsPromptInput = BasePromptInput & {
  topic: string;
  cardCount?: number;
};

export type QuizPromptInput = BasePromptInput & {
  topic: string;
  questionCount?: number;
};

export type InterviewQuestionsPromptInput = BasePromptInput & {
  topic: string;
  questionCount?: number;
};

export type InterviewFeedbackPromptInput = {
  question: string;
  expectedAnswerPoints: string[];
  userAnswer: string;
  difficulty?: AiDifficulty;
};

function truncateContext(text: string | undefined): string | null {
  const trimmed = text?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, MAX_MATERIAL_CONTEXT_CHARS);
}

function truncateInterviewAnswer(text: string): string {
  return text.trim().slice(0, MAX_INTERVIEW_ANSWER_CHARS);
}

function formatMaterialContext(materialContext: string | undefined): string {
  const context = truncateContext(materialContext);

  if (!context) {
    return "No uploaded material context was provided.";
  }

  return `Use this material context when creating the output:\n${context}`;
}

function formatDifficulty(difficulty: AiDifficulty | undefined): AiDifficulty {
  return difficulty ?? "beginner";
}

function formatTaskCount(taskCount: number | undefined): string {
  if (!taskCount) {
    return "Generate 5 to 10 useful tasks when possible.";
  }

  return `Generate exactly ${taskCount} useful tasks.`;
}

function jsonOnlyRules(): string {
  return [
    "Return valid JSON only.",
    "Do not include markdown fences, prose, comments, or explanations outside JSON.",
    "Do not generate database IDs.",
    "The backend will set user_id and database IDs.",
    "Use positive order_index values starting at 1.",
    "Keep content concise, practical, and student-friendly.",
    "Do not include citations, source cards, chunk references, or retrieval metadata.",
  ].join("\n");
}

export function buildRoadmapPrompt(input: RoadmapPromptInput): string {
  const subject = input.goalTitle ?? input.topic ?? "the selected learning topic";

  return `You are SkillForge AI, a practical learning roadmap generator.

Create a realistic ordered learning roadmap for: ${subject}
Difficulty: ${formatDifficulty(input.difficulty)}
Target duration: ${input.targetDuration ?? "Choose a realistic duration"}

${formatMaterialContext(input.materialContext)}

${jsonOnlyRules()}
Return JSON with this exact shape:
{
  "title": "Roadmap title",
  "description": "Short roadmap summary",
  "difficulty": "beginner | intermediate | advanced",
  "estimated_duration": "Example: 2 weeks",
  "tasks": [
    {
      "order_index": 1,
      "title": "Task title",
      "description": "What the learner should do",
      "estimated_time": "Example: 30 minutes"
    }
  ]
}

${formatTaskCount(input.taskCount)}`;
}

export function buildFlashcardsPrompt(input: FlashcardsPromptInput): string {
  return `You are SkillForge AI, a flashcard generator for study revision.

Create exactly ${input.cardCount ?? 10} flashcards for topic: ${input.topic}
Difficulty: ${formatDifficulty(input.difficulty)}

${formatMaterialContext(input.materialContext)}

${jsonOnlyRules()}
Each flashcard must have a clear front and back. Return exactly ${input.cardCount ?? 10} flashcards. If material context is provided, use facts from it.
Return JSON with this exact shape:
{
  "deck_title": "Flashcard deck title",
  "topic": "Deck topic",
  "flashcards": [
    {
      "order_index": 1,
      "front": "Question or cue",
      "back": "Answer or explanation",
      "topic": "Card topic",
      "difficulty": "beginner | intermediate | advanced"
    }
  ]
}`;
}

export function buildQuizPrompt(input: QuizPromptInput): string {
  return `You are SkillForge AI, a multiple-choice quiz generator.

Create ${input.questionCount ?? 8} multiple-choice questions for topic: ${input.topic}
Difficulty: ${formatDifficulty(input.difficulty)}

${formatMaterialContext(input.materialContext)}

${jsonOnlyRules()}
Each question must have exactly 4 distinct non-empty options.
Each correct_answer must exactly match one of the options.
Each question must have exactly one correct answer and a concise explanation.
If material context is provided, questions must be answerable from it.
Return JSON with this exact shape:
{
  "quiz_title": "Quiz title",
  "topic": "Quiz topic",
  "difficulty": "beginner | intermediate | advanced",
  "questions": [
    {
      "order_index": 1,
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Why this option is correct",
      "topic": "Question topic",
      "difficulty": "beginner | intermediate | advanced"
    }
  ]
}`;
}

export function buildInterviewQuestionsPrompt(
  input: InterviewQuestionsPromptInput,
): string {
  return `You are SkillForge AI, a technical mock interview question generator.

Create ${input.questionCount ?? 8} text-only interview questions for topic: ${input.topic}
Difficulty: ${formatDifficulty(input.difficulty)}

${formatMaterialContext(input.materialContext)}

${jsonOnlyRules()}
Questions should help a learner practice clear technical explanations.
If material context is provided, keep questions relevant to it.
Do not create answer submission, scoring, or feedback.
Return JSON with this exact shape:
{
  "session_title": "Mock interview title",
  "topic": "Interview topic",
  "difficulty": "beginner | intermediate | advanced",
  "questions": [
    {
      "order_index": 1,
      "question": "Interview question",
      "expected_answer_points": ["Point the answer should mention"],
      "difficulty": "beginner | intermediate | advanced",
      "topic": "Question topic"
    }
  ]
}`;
}

export function buildInterviewFeedbackPrompt(
  input: InterviewFeedbackPromptInput,
): string {
  const expectedPoints = input.expectedAnswerPoints.length > 0
    ? input.expectedAnswerPoints.map((point, index) => `${index + 1}. ${point}`).join("\n")
    : "No expected answer points were stored. Judge the answer against the question directly.";

  return `You are SkillForge AI, a constructive technical interview feedback assistant.

Interview question:
${input.question}

Expected answer points:
${expectedPoints}

User answer:
${truncateInterviewAnswer(input.userAnswer)}

Difficulty: ${formatDifficulty(input.difficulty)}

${jsonOnlyRules()}
Feedback rules:
- Be constructive, direct, and practical.
- Do not be harsh.
- Do not overpraise weak answers.
- Do not pretend missing concepts were covered.
- Mention concrete improvements the learner can practice next.
- Score must be a number from 0 to 10.

Return JSON with this exact shape:
{
  "strengths": ["What the answer did well"],
  "missing_points": ["What important point was missing or unclear"],
  "improved_answer": "A concise stronger answer the learner can study",
  "score": 7,
  "next_practice_tip": "One practical thing to improve next"
}`;
}