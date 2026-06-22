import Link from "next/link";
import { Badge, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui";
import { Section } from "@/components/layout";
import { publicRoutes } from "@/config/routes";

const plans = [
  {
    name: "Free",
    label: "Start",
    accent: "yellow",
    description: "A starter shell for trying the learning workflow with basic limits later.",
    items: ["Landing demo", "Future note upload", "Future practice modes"],
    cta: "Start Free",
  },
  {
    name: "Pro / Demo",
    label: "Portfolio",
    accent: "green",
    description: "A planned demo tier for showing the full study loop in a portfolio review.",
    items: ["More AI actions later", "Progress workspace", "Interview prep flow"],
    cta: "Preview Demo Plan",
  },
  {
    name: "MVP Story",
    label: "Builder",
    accent: "blue",
    description: "The planned MVP build story: auth, uploads, RAG, quizzes, progress, and deployment.",
    items: ["Architecture showcase", "Source-grounded learning", "SaaS-style foundations"],
    cta: "See MVP Story",
  },
] as const;

const badgeVariant = {
  yellow: "yellow",
  green: "green",
  blue: "blue",
} as const;

export function PricingSection() {
  return (
    <Section
      description="Plan cards are a static visual shell only. No Stripe, checkout, billing, or payment flow exists in this phase."
      eyebrow="Pricing shell"
      title="Simple plans for the future MVP story."
      variant="muted"
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card className="bg-paper-base" key={plan.name}>
            <CardHeader>
              <Badge variant={badgeVariant[plan.accent]}>{plan.label}</Badge>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="font-medium leading-7">{plan.description}</p>
              <ul className="grid gap-3">
                {plan.items.map((item) => (
                  <li className="flex gap-3 font-black" key={item}>
                    <span aria-hidden="true">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link
                className="pressable inline-flex min-h-11 items-center justify-center rounded-md bg-accent-yellow px-4 py-2.5 text-sm font-black leading-none no-underline hover:bg-accent-yellow"
                href={publicRoutes.signup}
              >
                {plan.cta}
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Section>
  );
}
