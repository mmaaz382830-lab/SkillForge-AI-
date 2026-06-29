"use client";

import { type FormEvent, useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  loadInterviewPracticeState,
  submitInterviewAnswer,
} from "@/lib/interviews/actions";
import type {
  InterviewFeedback,
  InterviewSessionPracticeState,
} from "@/types/interviews";

const EMPTY_ANSWER_MESSAGE =
  "Please enter an answer first so I can give useful feedback.";
const FEEDBACK_ERROR_MESSAGE = "Could not generate feedback.";

const difficultyVariants: Record<string, BadgeVariant> = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "pink",
};

type InterviewPracticePanelProps = {
  sessionId: string;
  onClose?: () => void;
};

function formatDifficulty(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function getFirstUnansweredIndex(state: InterviewSessionPracticeState): number {
  const index = state.questions.findIndex((question) => !question.answered);
  return index >= 0 ? index : 0;
}

function FeedbackList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((item, index) => (
        <li
          className="rounded-md border-2 border-black bg-paper-base px-3 py-2 text-sm font-semibold leading-6 shadow-brutal-sm"
          key={`${item}-${index}`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function InterviewFeedbackCard({ feedback }: { feedback: InterviewFeedback }) {
  return (
    <article className="overflow-hidden rounded-lg border-2 border-black bg-paper-base shadow-brutal">
      <div className="border-b-2 border-black bg-accent-pink px-4 py-3 sm:px-5">
        <p className="text-xs font-black uppercase text-zinc-700">
          Interview feedback
        </p>
        <h4 className="mt-1 font-heading text-xl font-black leading-tight">
          Score: {feedback.score} / 10
        </h4>
      </div>

      <div className="grid gap-4 p-4 sm:p-5">
        <section className="grid gap-2" aria-labelledby="feedback-strengths">
          <h5
            className="flex items-center gap-2 text-sm font-black uppercase"
            id="feedback-strengths"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded border-2 border-black bg-accent-green text-xs font-black">
              OK
            </span>
            Strengths
          </h5>
          <FeedbackList items={feedback.strengths} />
        </section>

        <section className="grid gap-2" aria-labelledby="feedback-missing">
          <h5
            className="flex items-center gap-2 text-sm font-black uppercase"
            id="feedback-missing"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded border-2 border-black bg-accent-pink text-xs font-black">
              !
            </span>
            Missing points
          </h5>
          <FeedbackList items={feedback.missing_points} />
        </section>

        <section className="grid gap-2" aria-labelledby="feedback-improved">
          <h5 className="text-sm font-black uppercase" id="feedback-improved">
            Improved answer
          </h5>
          <p className="rounded-md border-2 border-black bg-accent-blue px-3 py-2 text-sm font-semibold leading-6 shadow-brutal-sm">
            {feedback.improved_answer}
          </p>
        </section>

        <section className="rounded-md border-2 border-black bg-paper-muted px-3 py-2 shadow-brutal-sm">
          <h5 className="text-sm font-black uppercase">Next practice tip</h5>
          <p className="mt-1 text-sm font-semibold leading-6">
            {feedback.next_practice_tip}
          </p>
        </section>
      </div>
    </article>
  );
}

function CompletionState({ state }: { state: InterviewSessionPracticeState }) {
  const score = state.score == null ? null : Number(state.score);

  return (
    <section className="rounded-lg border-2 border-black bg-accent-green p-4 shadow-brutal sm:p-5">
      <p className="text-xs font-black uppercase text-zinc-700">
        Interview completed
      </p>
      <h3 className="mt-1 font-heading text-2xl font-black leading-tight">
        You answered all {state.total_question_count} questions.
      </h3>
      <p className="mt-2 font-semibold leading-7">
        {score == null
          ? "Your feedback has been saved for review."
          : `Session score: ${score} / 10.`}
      </p>
      {state.overall_feedback ? (
        <p className="mt-2 rounded-md border-2 border-black bg-paper-base px-3 py-2 text-sm font-semibold leading-6 shadow-brutal-sm">
          {state.overall_feedback}
        </p>
      ) : null}
    </section>
  );
}

export function InterviewPracticePanel({
  sessionId,
  onClose,
}: InterviewPracticePanelProps) {
  const router = useRouter();
  const answerId = useId();
  const [practiceState, setPracticeState] =
    useState<InterviewSessionPracticeState | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loadingState, setLoadingState] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadState() {
      setLoadingState(true);
      setError(null);
      setAnswer("");

      const result = await loadInterviewPracticeState(sessionId);

      if (!active) return;

      if (!result.ok) {
        setPracticeState(null);
        setError(result.error);
        setLoadingState(false);
        return;
      }

      setPracticeState(result.data);
      setCurrentIndex(getFirstUnansweredIndex(result.data));
      setLoadingState(false);
    }

    void loadState();

    return () => {
      active = false;
    };
  }, [sessionId]);

  const currentQuestion = practiceState?.questions[currentIndex] ?? null;
  const allAnswered = Boolean(
    practiceState &&
      practiceState.total_question_count > 0 &&
      practiceState.completed_question_count === practiceState.total_question_count,
  );
  const progressDescription = useMemo(() => {
    if (!practiceState) return undefined;
    return `${practiceState.completed_question_count} of ${practiceState.total_question_count} questions answered.`;
  }, [practiceState]);

  function moveToQuestion(index: number) {
    setCurrentIndex(index);
    setAnswer("");
    setError(null);
  }

  function moveNext() {
    if (!practiceState) return;
    const nextIndex = Math.min(currentIndex + 1, practiceState.questions.length - 1);
    moveToQuestion(nextIndex);
  }

  function movePrevious() {
    const previousIndex = Math.max(currentIndex - 1, 0);
    moveToQuestion(previousIndex);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!practiceState || !currentQuestion || currentQuestion.answered) {
      return;
    }

    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) {
      setError(EMPTY_ANSWER_MESSAGE);
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await submitInterviewAnswer({
      sessionId: practiceState.id,
      questionMessageId: currentQuestion.id,
      answer: trimmedAnswer,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(
        result.error === EMPTY_ANSWER_MESSAGE
          ? EMPTY_ANSWER_MESSAGE
          : result.error || FEEDBACK_ERROR_MESSAGE,
      );
      return;
    }

    setPracticeState((current) => {
      if (!current) return current;

      const questions = current.questions.map((question) => {
        if (question.id !== currentQuestion.id) return question;

        return {
          ...question,
          answered: true,
          answer: {
            id: result.data.answer_message_id,
            content: trimmedAnswer,
            created_at: new Date().toISOString(),
          },
          feedback: {
            ...result.data.feedback,
            id: result.data.feedback_message_id,
            created_at: new Date().toISOString(),
          },
        };
      });
      const completedCount = questions.filter((question) => question.answered).length;

      return {
        ...current,
        status: result.data.completed ? "completed" : current.status,
        score: result.data.score ?? current.score,
        completed_question_count: completedCount,
        questions,
      };
    });

    setAnswer("");
    router.refresh();
  }

  if (loadingState) {
    return (
      <section className="brutal-card grid gap-4 bg-paper-muted p-5" aria-live="polite">
        <div className="h-5 w-40 rounded border-2 border-black bg-paper-base shadow-brutal-sm" />
        <div className="h-28 rounded-lg border-2 border-black bg-paper-base shadow-brutal-sm" />
        <p className="font-semibold">Loading interview practice...</p>
      </section>
    );
  }

  if (!practiceState || !currentQuestion) {
    return (
      <section className="rounded-lg border-2 border-black bg-accent-pink p-5 shadow-brutal" role="alert">
        <h3 className="font-heading text-2xl font-black">Could not load practice.</h3>
        <p className="mt-2 font-semibold leading-7">
          {error ?? "Please refresh the page and try again."}
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-5" aria-label="Interview practice panel">
      <div className="brutal-card grid gap-4 overflow-hidden p-0">
        <div className="border-b-2 border-black bg-accent-pink px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase text-zinc-700">
                Text-only practice
              </p>
              <h3 className="mt-1 font-heading text-2xl font-black leading-tight">
                {practiceState.topic}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={difficultyVariants[practiceState.difficulty] ?? "neutral"}>
                {formatDifficulty(practiceState.difficulty)}
              </Badge>
              {practiceState.status === "completed" ? (
                <Badge variant="green">Completed</Badge>
              ) : (
                <Badge variant="pink">In practice</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5">
          <Progress
            description={progressDescription}
            indicatorClassName="bg-accent-green"
            label="Interview progress"
            max={practiceState.total_question_count}
            value={practiceState.completed_question_count}
          />

          {allAnswered ? <CompletionState state={practiceState} /> : null}

          <div className="flex flex-wrap gap-2" aria-label="Question navigation">
            {practiceState.questions.map((question, index) => (
              <button
                aria-current={index === currentIndex ? "step" : undefined}
                className={`min-h-11 rounded-md border-2 border-black px-3 py-2 text-sm font-black shadow-brutal-sm transition hover:-translate-y-0.5 hover:shadow-brutal ${
                  index === currentIndex
                    ? "bg-accent-pink"
                    : question.answered
                      ? "bg-accent-green"
                      : "bg-paper-base"
                }`}
                key={question.id}
                onClick={() => moveToQuestion(index)}
                type="button"
              >
                Q{index + 1}
                <span className="sr-only">
                  {question.answered ? " answered" : " unanswered"}
                </span>
              </button>
            ))}
          </div>

          <article className="rounded-lg border-2 border-black bg-paper-base p-4 shadow-brutal-sm sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <Badge variant="neutral">
                  Question {currentIndex + 1} of {practiceState.total_question_count}
                </Badge>
                <Badge variant={difficultyVariants[currentQuestion.difficulty] ?? "neutral"}>
                  {formatDifficulty(currentQuestion.difficulty)}
                </Badge>
                {currentQuestion.topic ? (
                  <Badge variant="blue">{currentQuestion.topic}</Badge>
                ) : null}
              </div>
              {currentQuestion.answered ? (
                <Badge variant="green">Answered</Badge>
              ) : (
                <Badge variant="pink">Needs answer</Badge>
              )}
            </div>

            <h4 className="font-heading text-2xl font-black leading-tight">
              {currentQuestion.question}
            </h4>

            {currentQuestion.answer ? (
              <section className="mt-5 rounded-lg border-2 border-black bg-paper-muted p-4 shadow-brutal-sm">
                <p className="text-xs font-black uppercase text-zinc-600">
                  Your answer
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7">
                  {currentQuestion.answer.content}
                </p>
              </section>
            ) : (
              <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
                <Textarea
                  className="min-h-48"
                  disabled={submitting}
                  error={error ?? undefined}
                  helperText="Write a concise interview-style answer. Feedback is generated after you submit."
                  id={answerId}
                  label="Your answer"
                  onChange={(event) => {
                    setAnswer(event.target.value);
                    if (error === EMPTY_ANSWER_MESSAGE) setError(null);
                  }}
                  placeholder="Explain your answer as if you were speaking in an interview."
                  value={answer}
                />

                {error && error !== EMPTY_ANSWER_MESSAGE ? (
                  <p
                    className="rounded-md border-2 border-black bg-accent-pink px-3 py-2 text-sm font-black"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}

                <Button disabled={submitting} type="submit" variant="primary">
                  {submitting ? "Generating feedback..." : "Submit answer"}
                </Button>
              </form>
            )}
          </article>

          {currentQuestion.feedback ? (
            <InterviewFeedbackCard feedback={currentQuestion.feedback} />
          ) : currentQuestion.answered ? (
            <section className="rounded-lg border-2 border-black bg-paper-muted p-4 shadow-brutal-sm">
              <h4 className="font-heading text-xl font-black">Feedback saved</h4>
              <p className="mt-2 text-sm font-semibold leading-6">
                Feedback exists for this answer but could not be displayed. Refresh the page to reload the session.
              </p>
            </section>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <Button
                disabled={currentIndex === 0 || submitting}
                onClick={movePrevious}
                type="button"
                variant="secondary"
              >
                Previous
              </Button>
              <Button
                disabled={currentIndex >= practiceState.questions.length - 1 || submitting}
                onClick={moveNext}
                type="button"
                variant="highlight"
              >
                Next question
              </Button>
            </div>
            {onClose ? (
              <Button disabled={submitting} onClick={onClose} type="button" variant="ghost">
                Close practice
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}