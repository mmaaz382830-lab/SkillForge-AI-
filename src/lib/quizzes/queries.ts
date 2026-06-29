import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Quiz,
  QuizActionResult,
  QuizAttempt,
  QuizAttemptReview,
  QuizQuestion,
  QuizView,
  SanitizedQuizForAttempt,
  SanitizedQuizQuestionForAttempt,
} from "@/types/quizzes";

const QUIZ_SELECT =
  "id,user_id,material_id,title,topic,difficulty,question_count,created_at,updated_at";

const QUESTION_SELECT =
  "id,quiz_id,user_id,question,options,correct_answer,explanation,topic,difficulty,order_index,created_at";

const ATTEMPT_QUESTION_SELECT =
  "id,quiz_id,question,options,topic,difficulty,order_index";

const QUIZ_ATTEMPT_SELECT =
  "id,quiz_id,user_id,score,total_questions,correct_count,answers,started_at,completed_at";

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
      .select(ATTEMPT_QUESTION_SELECT)
      .eq("user_id", user.data)
      .order("order_index", { ascending: true })
      .returns<SanitizedQuizQuestionForAttempt[]>(),
  ]);

  if (quizzesResult.error || questionsResult.error) {
    return {
      ok: false,
      error: "Could not load quizzes.",
    };
  }

  const questionsByQuizId = new Map<string, SanitizedQuizQuestionForAttempt[]>();

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
        topic: q.topic,
        difficulty: q.difficulty,
        order_index: q.order_index,
      })),
    })),
  };
}

export async function getSanitizedQuizForAttempt(
  quizId: string,
): Promise<QuizActionResult<SanitizedQuizForAttempt>> {
  const user = await getAuthenticatedQuizUserId();

  if (!user.ok) {
    return user;
  }

  const supabase = await createSupabaseServerClient();
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select(QUIZ_SELECT)
    .eq("id", quizId)
    .eq("user_id", user.data)
    .maybeSingle<Quiz>();

  if (quizError || !quiz) {
    return {
      ok: false,
      error: "Quiz not found.",
    };
  }

  const { data: questions, error: questionsError } = await supabase
    .from("quiz_questions")
    .select(ATTEMPT_QUESTION_SELECT)
    .eq("quiz_id", quiz.id)
    .eq("user_id", user.data)
    .order("order_index", { ascending: true })
    .returns<SanitizedQuizQuestionForAttempt[]>();

  if (questionsError) {
    return {
      ok: false,
      error: "Could not load quiz questions.",
    };
  }

  return {
    ok: true,
    data: {
      id: quiz.id,
      material_id: quiz.material_id,
      title: quiz.title,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      question_count: quiz.question_count,
      created_at: quiz.created_at,
      updated_at: quiz.updated_at,
      questions: questions ?? [],
    },
  };
}

export async function getQuizAttemptReview(
  attemptId: string,
): Promise<QuizActionResult<QuizAttemptReview>> {
  const user = await getAuthenticatedQuizUserId();

  if (!user.ok) {
    return user;
  }

  const supabase = await createSupabaseServerClient();
  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .select(QUIZ_ATTEMPT_SELECT)
    .eq("id", attemptId)
    .eq("user_id", user.data)
    .maybeSingle<QuizAttempt>();

  if (attemptError || !attempt) {
    return {
      ok: false,
      error: "Attempt not found.",
    };
  }

  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select(QUIZ_SELECT)
    .eq("id", attempt.quiz_id)
    .eq("user_id", user.data)
    .maybeSingle<Quiz>();

  if (quizError || !quiz) {
    return {
      ok: false,
      error: "Attempt not found.",
    };
  }

  const { data: questions, error: questionsError } = await supabase
    .from("quiz_questions")
    .select(QUESTION_SELECT)
    .eq("quiz_id", quiz.id)
    .eq("user_id", user.data)
    .order("order_index", { ascending: true })
    .returns<QuizQuestion[]>();

  if (questionsError) {
    return {
      ok: false,
      error: "Could not load quiz review.",
    };
  }

  const answers = attempt.answers ?? {};
  const reviewItems = (questions ?? []).map((question) => {
    const selectedAnswer = answers[question.id] ?? null;

    return {
      question_id: question.id,
      question: question.question,
      selected_answer: selectedAnswer,
      correct_answer: question.correct_answer,
      is_correct: selectedAnswer === question.correct_answer,
      explanation: question.explanation ?? null,
      topic: question.topic,
      difficulty: question.difficulty,
    };
  });
  const weakTopics = Array.from(
    new Set(
      reviewItems
        .filter((item) => !item.is_correct && item.topic)
        .map((item) => item.topic as string),
    ),
  );

  return {
    ok: true,
    data: {
      id: attempt.id,
      quiz_id: attempt.quiz_id,
      quiz_title: quiz.title,
      score: Number(attempt.score),
      total_questions: attempt.total_questions,
      correct_count: attempt.correct_count,
      completed_at: attempt.completed_at,
      weak_topics: weakTopics,
      review_items: reviewItems,
    },
  };
}



