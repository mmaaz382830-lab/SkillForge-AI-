import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Quiz,
  QuizActionResult,
  QuizQuestion,
  QuizView,
} from "@/types/quizzes";

const QUIZ_SELECT =
  "id,user_id,material_id,title,topic,difficulty,question_count,created_at,updated_at";

const QUESTION_SELECT =
  "id,quiz_id,user_id,question,options,correct_answer,explanation,topic,difficulty,order_index,created_at,updated_at";

export async function getAuthenticatedQuizUserId(): Promise<
  QuizActionResult<string>
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      ok: false,
      error: "Please log in to continue.",
    };
  }

  return {
    ok: true,
    data: data.user.id,
  };
}

export async function listQuizViews(): Promise<QuizActionResult<QuizView[]>> {
  const user = await getAuthenticatedQuizUserId();

  if (!user.ok) {
    return user;
  }

  const supabase = await createSupabaseServerClient();
  const [quizzesResult, questionsResult] = await Promise.all([
    supabase
      .from("quizzes")
      .select(QUIZ_SELECT)
      .eq("user_id", user.data)
      .order("created_at", { ascending: false })
      .returns<Quiz[]>(),
    supabase
      .from("quiz_questions")
      .select(QUESTION_SELECT)
      .eq("user_id", user.data)
      .order("order_index", { ascending: true })
      .returns<QuizQuestion[]>(),
  ]);

  if (quizzesResult.error || questionsResult.error) {
    return {
      ok: false,
      error: "Could not load quizzes.",
    };
  }

  const questionsByQuizId = new Map<string, QuizQuestion[]>();

  for (const question of questionsResult.data ?? []) {
    const questions = questionsByQuizId.get(question.quiz_id) ?? [];
    questions.push(question);
    questionsByQuizId.set(question.quiz_id, questions);
  }

  return {
    ok: true,
    data: (quizzesResult.data ?? []).map((quiz) => ({
      id: quiz.id,
      material_id: quiz.material_id,
      title: quiz.title,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      question_count: quiz.question_count,
      created_at: quiz.created_at,
      updated_at: quiz.updated_at,
      questions: (questionsByQuizId.get(quiz.id) ?? []).map((q) => ({
        id: q.id,
        quiz_id: q.quiz_id,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        topic: q.topic,
        difficulty: q.difficulty,
        order_index: q.order_index,
        created_at: q.created_at,
        updated_at: q.updated_at,
      })),
    })),
  };
}
