import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Container } from "@/components/layout";

export function SourceGroundedSection() {
  return (
    <section className="py-12 sm:py-16">
      <Container className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          <Badge variant="blue">Source-grounded learning</Badge>
          <h2>Designed for answers from your uploaded notes.</h2>
          <p className="text-lg font-medium leading-8">
            SkillForge AI is planned around note-grounded answers, not random
            generic replies. When the RAG phase is implemented, the chat
            experience should use uploaded material as its source context.
          </p>
        </div>
        <Card className="bg-accent-blue">
          <CardHeader>
            <Badge variant="blue">Static RAG preview</Badge>
            <CardTitle>Study answer sheet</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-lg border-2 border-black bg-paper-base p-4">
              <p className="font-black">Question</p>
              <p className="mt-2 font-medium">
                What should I revise before a React hooks interview?
              </p>
            </div>
            <div className="rounded-lg border-2 border-black bg-paper-base p-4">
              <p className="font-black">Designed answer behavior</p>
              <p className="mt-2 font-medium leading-7">
                Use the uploaded notes as context, explain the supported points,
                and say when the material does not contain enough information.
              </p>
            </div>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
