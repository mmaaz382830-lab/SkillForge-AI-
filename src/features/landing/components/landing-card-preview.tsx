import { Badge } from "@/components/ui";

export function LandingCardPreview() {
  return (
    <div
      aria-label="Static preview of SkillForge learning cards"
      className="relative mx-auto grid w-full max-w-xl gap-4"
    >
      <div className="brutal-card rotate-1 bg-accent-blue p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="blue">Upload card</Badge>
          <span className="font-mono text-xs font-black">PDF · TXT · NOTES</span>
        </div>
        <h3 className="mt-5 text-2xl">React interview notes.pdf</h3>
        <p className="mt-3 font-medium leading-7">
          Static shell for the future material upload flow. No file upload is
          active in this phase.
        </p>
      </div>

      <div className="brutal-card -rotate-1 bg-accent-yellow p-5">
        <Badge variant="yellow">Generated roadmap</Badge>
        <div className="mt-5 grid gap-3">
          {["Read lifecycle basics", "Practice hooks", "Explain rendering"].map(
            (item) => (
              <div
                className="flex items-center gap-3 rounded-md border-2 border-black bg-paper-base px-3 py-2 font-black"
                key={item}
              >
                <span aria-hidden="true" className="h-3 w-3 rounded-full bg-accent-green" />
                {item}
              </div>
            ),
          )}
        </div>
      </div>

      <div className="brutal-card rotate-1 bg-paper-base p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border-2 border-black bg-accent-pink p-4">
            <Badge variant="pink">Quiz</Badge>
            <p className="mt-3 font-black leading-6">
              Which hook handles memoized values?
            </p>
          </div>
          <div className="rounded-lg border-2 border-black bg-card-dark p-4 text-paper-base">
            <Badge variant="dark">Interview</Badge>
            <p className="mt-3 font-black leading-6">
              Explain state updates clearly.
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-lg border-2 border-black bg-accent-blue p-4">
          <Badge variant="blue">Source-grounded chat</Badge>
          <p className="mt-3 font-medium leading-7">
            Designed to answer from uploaded notes when the RAG phase is built.
          </p>
        </div>
      </div>
    </div>
  );
}
