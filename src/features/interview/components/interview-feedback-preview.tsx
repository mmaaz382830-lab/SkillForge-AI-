/**
 * InterviewFeedbackPreview — visual-only structured feedback card.
 * Shows Strengths / Missing points / Improved answer / Next tip.
 * No AI generation, no backend logic.
 */
export function InterviewFeedbackPreview() {
  return (
    <article
      className="brutal-card overflow-hidden"
      aria-label="Interview feedback preview"
    >
      {/* Header */}
      <div className="border-b-2 border-black bg-accent-pink px-5 py-4">
        <p className="text-xs font-black uppercase tracking-wider">
          Interview feedback
        </p>
        <h3 className="font-heading text-xl font-black leading-tight">
          Question 1 of 3 — Promises & async/await
        </h3>
      </div>

      {/* Score chip */}
      <div className="border-b-2 border-black bg-paper-muted px-5 py-3">
        <span className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-accent-yellow px-3 py-1 text-sm font-black shadow-brutal-sm">
          Score: 7 / 10
        </span>
      </div>

      <div className="grid gap-5 p-5 sm:p-6">
        {/* Strengths */}
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-wider">
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded border-2 border-black bg-accent-green text-xs font-black"
              aria-hidden="true"
            >
              ✓
            </span>
            Strengths
          </h4>
          <p className="rounded-md border-2 border-black bg-accent-green px-3 py-2 text-sm font-medium leading-6">
            Correctly explained how Promises work and described the async/await
            syntax. Good use of error handling with try/catch.
          </p>
        </div>

        {/* Missing points */}
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-wider">
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded border-2 border-black bg-accent-pink text-xs font-black"
              aria-hidden="true"
            >
              !
            </span>
            Missing points
          </h4>
          <p className="rounded-md border-2 border-black bg-accent-pink px-3 py-2 text-sm font-medium leading-6">
            Did not cover Promise.all or race conditions. Microtask queue
            explanation was incomplete.
          </p>
        </div>

        {/* Improved answer */}
        <div>
          <h4 className="mb-2 text-sm font-black uppercase tracking-wider">
            Improved answer
          </h4>
          <p className="rounded-md border-2 border-black bg-accent-blue px-3 py-2 text-sm font-medium leading-6">
            A Promise represents a value that may be available now, later, or
            never. Async functions always return a Promise. Promise.all runs
            multiple Promises in parallel. Microtasks run before the next
            macrotask in the event loop.
          </p>
        </div>

        {/* Next tip */}
        <div className="rounded-md border-2 border-black bg-paper-muted px-3 py-2">
          <p className="text-sm font-semibold">
            <span className="font-black">Next practice tip:</span> Study the
            event loop and microtask queue before your next interview.
          </p>
        </div>
      </div>
    </article>
  );
}
