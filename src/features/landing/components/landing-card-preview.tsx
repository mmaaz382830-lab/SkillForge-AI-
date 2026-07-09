import { Badge } from "@/components/ui";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function LandingCardPreview() {
  return (
    <ScrollReveal>
      <div
        aria-label="Preview of SkillForge learning cards"
        className="relative mx-auto grid w-full min-w-0 max-w-xl gap-4 px-0.5 sm:px-0"
      >
        <div className="brutal-card bg-accent-blue p-4 split-card-left sm:rotate-1 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge variant="blue">Upload card</Badge>
            <span className="font-mono text-xs font-black">PDF · TXT · NOTES</span>
          </div>
          <h3 className="mt-4 text-xl sm:mt-5 sm:text-2xl">React interview notes.pdf</h3>
          <p className="mt-3 text-sm font-medium leading-6 sm:text-base sm:leading-7">
            Upload your study materials, notes, or reference documents to construct your personalized knowledge base.
          </p>
        </div>

        <div className="brutal-card bg-accent-yellow p-4 split-card-center sm:-rotate-1 sm:p-5">
          <Badge variant="yellow">Generated roadmap</Badge>
          <div className="mt-5 grid gap-3">
            {["Read lifecycle basics", "Practice hooks", "Explain rendering"].map(
              (item) => (
                <div
                  className="flex min-w-0 items-center gap-3 rounded-md border-2 border-black bg-paper-base px-3 py-2 text-sm font-black sm:text-base"
                  key={item}
                >
                  <span aria-hidden="true" className="h-3 w-3 rounded-full bg-accent-green" />
                  {item}
                </div>
              ),
            )}
          </div>
        </div>

        <div className="brutal-card bg-paper-base p-4 split-card-right sm:rotate-1 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="rounded-lg border-2 border-black bg-accent-pink p-3 sm:p-4">
              <Badge variant="pink">Quiz</Badge>
              <p className="mt-3 font-black leading-6">
                Which hook handles memoized values?
              </p>
            </div>
            <div className="rounded-lg border-2 border-black bg-card-dark p-3 text-paper-base sm:p-4">
              <Badge variant="dark">Interview</Badge>
              <p className="mt-3 font-black leading-6">
                Explain state updates clearly.
              </p>
            </div>
          </div>
          <div className="mt-3 rounded-lg border-2 border-black bg-accent-blue p-3 sm:mt-4 sm:p-4">
            <Badge variant="blue">Source-grounded chat</Badge>
            <p className="mt-3 text-sm font-medium leading-6 sm:text-base sm:leading-7">
              Ask questions directly to your uploaded materials and get instant, source-grounded answers.
            </p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
