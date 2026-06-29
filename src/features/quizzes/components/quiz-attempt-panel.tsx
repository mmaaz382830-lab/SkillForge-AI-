"use client";

import { useEffect, useMemo, useState } from "react";

import { ErrorState } from "@/components/states/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  loadQuizAttemptReview,
  loadQuizForAttempt,
  submitQuizAttempt,
} from "@/lib/quizzes/actions";
import type {
  QuizAttemptReview,
  QuizAttemptSummary,
  SanitizedQuizForAttempt,
} from "@/types/quizzes";

type QuizAttemptPanelProps = {
  quizId: string;
  onClose: () => void;
};

function optionLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

function formatDifficulty(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function QuizAttemptPanel({ quizId, onClose }: QuizAttemptPanelProps) {
  const [quiz, setQuiz] = useState<SanitizedQuizForAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [summary, setSummary] = useState<QuizAttemptSummary | null>(null);
  const [review, setReview] = useState<QuizAttemptReview | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadAttempt() {
      setLoading(true);
      setError(null);
      setReviewError(null);
      setSummary(null);
      setReview(null);
      setAnswers({});
      setCurrentIndex(0);

      const result = await loadQuizForAttempt(quizId);

      if (ignore) {
        return;
      }

      if (!result.ok) {
        setError(result.error);
        setQuiz(null);
      } else {
        setQuiz(result.data);
      }

      setLoading(false);
    }

    void loadAttempt();

    return () => {
      ignore = true;
    };
  }, [quizId]);

  const currentQuestion = quiz?.questions[currentIndex] ?? null;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progressPercent = quiz?.questions.length
    ? Math.round(((currentIndex + 1) / quiz.questions.length) * 100)
    : 0;

  function handleSelect(questionId: string, option: string) {
    if (submitting || review) {
      return;
    }

    setError(null);
    setAnswers((current) => ({
      ...current,
      [questionId]: option,
    }));
  }

  async function handleSubmit() {
    if (!quiz || submitting) {
      return;
    }

    if (answeredCount === 0) {
      setError("Please answer at least one question.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setReviewError(null);

    const result = await submitQuizAttempt({
      quizId: quiz.id,
      answers,
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    setSummary(result.data);
    const reviewResult = await loadQuizAttemptReview(result.data.id);

    if (!reviewResult.ok) {
      setReviewError(reviewResult.error);
    } else {
      setReview(reviewResult.data);
    }

    setSubmitting(false);
  }

  if (loading) {
    return (
      <section className="brutal-card grid gap-3 bg-accent-pink p-5 sm:p-6">
        <p className="text-xs font-black uppercase text-zinc-600">
          Practice mode
        </p>
        <h3 className="font-heading text-2xl font-black">Loading quiz...</h3>
        <div className="h-3 rounded border-2 border-black bg-paper-base shadow-brutal-sm" />
      </section>
    );
  }

  if (error && !quiz) {
    return (
      <ErrorState
        action={
          <Button onClick={onClose} variant="secondary">
            Back to quizzes
          </Button>
        }
        description={error}
        title="Could not start quiz."
      />
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <section className="brutal-card bg-paper-muted p-5 sm:p-6">
        <h3 className="font-heading text-2xl font-black">
          No questions available.
        </h3>
        <p className="mt-2 font-semibold leading-7">
          Generate a quiz with saved questions before starting practice.
        </p>
        <Button className="mt-4" onClick={onClose} variant="secondary">
          Back to quizzes
        </Button>
      </section>
    );
  }

  if (review || summary) {
    const score = review?.score ?? summary?.score ?? 0;
    const correct = review?.correct_count ?? summary?.correct_count ?? 0;
    const total = review?.total_questions ?? summary?.total_questions ?? 0;
    const weakTopics = review?.weak_topics ?? [];

    return (
      <section className="grid gap-5" aria-labelledby="quiz-review-heading">
        <div className="brutal-card bg-accent-green p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase text-zinc-700">
                Quiz result
              </p>
              <h3
                className="mt-1 font-heading text-3xl font-black"
                id="quiz-review-heading"
              >
                {score}% score
              </h3>
              <p className="mt-2 font-black">
                {correct} / {total} correct on {quiz.title}
              </p>
              {summary?.progress_warning ? (
                <p className="mt-3 rounded-md border-2 border-black bg-paper-base px-3 py-2 text-sm font-black">
                  {summary.progress_warning}
                </p>
              ) : null}
            </div>
            <Button onClick={onClose} variant="secondary">
              Back to quizzes
            </Button>
          </div>
        </div>

        <div className="rounded-lg border-2 border-black bg-paper-base p-5 shadow-brutal">
          <h4 className="font-heading text-xl font-black">Weak-topic basics</h4>
          {weakTopics.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {weakTopics.map((topic) => (
                <Badge key={topic} variant="pink">
                  Review {topic}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="mt-2 font-semibold leading-7">
              No weak topics from this attempt. Your missed-topic list is clear.
            </p>
          )}
        </div>

        {reviewError ? (
          <ErrorState
            description={reviewError}
            title="Score saved, but review could not load."
          />
        ) : null}

        {review ? (
          <div className="grid gap-4">
            {review.review_items.map((item, index) => {
              const selected = item.selected_answer ?? "No answer selected";

              return (
                <article
                  className="rounded-lg border-2 border-black bg-paper-base p-4 shadow-brutal-sm"
                  key={item.question_id}
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={item.is_correct ? "green" : "pink"}>
                        {item.is_correct ? "Correct" : "Needs review"}
                      </Badge>
                      {item.topic ? <Badge variant="neutral">{item.topic}</Badge> : null}
                      <Badge variant="neutral">
                        {formatDifficulty(item.difficulty)}
                      </Badge>
                    </div>
                    <span className="text-xs font-black text-zinc-500">
                      Q{index + 1}
                    </span>
                  </div>

                  <h4 className="font-heading text-lg font-black leading-snug">
                    {item.question}
                  </h4>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <div className="rounded-md border-2 border-black bg-paper-muted px-3 py-2.5 font-semibold">
                      <p className="text-xs font-black uppercase text-zinc-600">
                        Your answer
                      </p>
                      <p className="mt-1">{selected}</p>
                    </div>
                    <div className="rounded-md border-2 border-black bg-accent-green px-3 py-2.5 font-semibold">
                      <p className="text-xs font-black uppercase text-zinc-700">
                        Correct answer
                      </p>
                      <p className="mt-1">{item.correct_answer}</p>
                    </div>
                  </div>
                  {item.explanation ? (
                    <div className="mt-3 rounded-md border-2 border-black bg-accent-pink px-3 py-2.5">
                      <p className="text-xs font-black uppercase text-zinc-700">
                        Explanation
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-6">
                        {item.explanation}
                      </p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="brutal-card grid gap-5 bg-accent-pink p-5 sm:p-6" aria-labelledby="quiz-attempt-heading">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-zinc-700">
            Practice mode
          </p>
          <h3
            className="mt-1 font-heading text-3xl font-black leading-tight"
            id="quiz-attempt-heading"
          >
            {quiz.title}
          </h3>
          <p className="mt-2 font-semibold leading-7">
            Choose answers without seeing the key. You can submit after answering
            at least one question.
          </p>
        </div>
        <Button onClick={onClose} variant="secondary">
          Close practice
        </Button>
      </div>

      <div className="rounded-lg border-2 border-black bg-paper-base p-4 shadow-brutal-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="pink">Q{currentIndex + 1} of {quiz.questions.length}</Badge>
            <Badge variant="neutral">{answeredCount} answered</Badge>
          </div>
          <span className="text-sm font-black">{progressPercent}% through</span>
        </div>
        <div className="h-4 overflow-hidden rounded border-2 border-black bg-paper-muted">
          <div
            className="h-full bg-accent-green"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {error ? (
        <p
          className="rounded-md border-2 border-black bg-paper-base px-3 py-2 text-sm font-black"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {currentQuestion ? (
        <article className="rounded-lg border-2 border-black bg-paper-base p-4 shadow-brutal">
          <div className="mb-3 flex flex-wrap gap-2">
            {currentQuestion.topic ? (
              <Badge variant="neutral">{currentQuestion.topic}</Badge>
            ) : null}
            <Badge variant="neutral">
              {formatDifficulty(currentQuestion.difficulty)}
            </Badge>
          </div>
          <h4 className="font-heading text-xl font-black leading-snug">
            {currentQuestion.question}
          </h4>
          <div className="mt-4 grid gap-3" role="radiogroup" aria-label="Answer options">
            {currentQuestion.options.map((option, index) => {
              const selected = answers[currentQuestion.id] === option;

              return (
                <button
                  aria-checked={selected}
                  className={`liftable flex min-h-12 items-start gap-3 rounded-md border-2 border-black px-4 py-3 text-left font-semibold shadow-brutal-sm transition ${
                    selected ? "bg-accent-yellow" : "bg-paper-muted"
                  }`}
                  disabled={submitting}
                  key={`${currentQuestion.id}-${option}`}
                  onClick={() => handleSelect(currentQuestion.id, option)}
                  role="radio"
                  type="button"
                >
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 border-black bg-paper-base text-xs font-black">
                    {optionLabel(index)}
                  </span>
                  <span className="leading-relaxed">{option}</span>
                  {selected ? (
                    <span className="ml-auto shrink-0 rounded border border-black bg-paper-base px-2 py-0.5 text-xs font-black">
                      Selected
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </article>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Button
            disabled={currentIndex === 0 || submitting}
            onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
            variant="secondary"
          >
            Previous
          </Button>
          <Button
            disabled={currentIndex === quiz.questions.length - 1 || submitting}
            onClick={() =>
              setCurrentIndex((index) =>
                Math.min(quiz.questions.length - 1, index + 1),
              )
            }
            variant="secondary"
          >
            Next
          </Button>
        </div>
        <Button loading={submitting} onClick={handleSubmit} variant="primary">
          Submit quiz
        </Button>
      </div>
    </section>
  );
}
