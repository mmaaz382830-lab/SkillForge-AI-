import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { dashboardRoutes } from "@/config/routes";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { AuthMessage } from "@/features/auth/components/auth-message";
import {
  DashboardStatCard,
  QuickActionCard,
  RecentActivityCard,
  DashboardEmptyPanel,
  UsageCard,
} from "@/features/dashboard/components";

export const metadata: Metadata = {
  title: `Dashboard — ${siteConfig.name}`,
  description: "Your SkillForge AI learning desk. View your materials, roadmaps, quizzes, and progress.",
};

type DashboardPageProps = {
  searchParams: Promise<{
    authError?: string | string[];
  }>;
};

const STAT_CARDS = [
  { label: "Materials uploaded", value: 1, accent: "blue" as const },
  { label: "Roadmaps created", value: 2, accent: "yellow" as const },
  { label: "Flashcard decks", value: 1, accent: "green" as const },
  { label: "Quizzes attempted", value: 3, accent: "pink" as const },
  { label: "Tasks completed", value: 7, suffix: "%", accent: "green" as const },
  { label: "AI generations left", value: 7, accent: "neutral" as const },
];

const QUICK_ACTIONS = [
  {
    label: "Upload material",
    description: "Add a PDF, TXT, or paste your notes.",
    href: dashboardRoutes.materials,
    accent: "blue" as const,
    emoji: "📄",
  },
  {
    label: "Generate roadmap",
    description: "Turn a topic into a structured learning plan.",
    href: dashboardRoutes.roadmaps,
    accent: "yellow" as const,
    emoji: "🗺️",
  },
  {
    label: "Start a quiz",
    description: "Practice from your uploaded material.",
    href: dashboardRoutes.quizzes,
    accent: "pink" as const,
    emoji: "✏️",
  },
  {
    label: "Mock interview",
    description: "Prepare technical explanations from your notes.",
    href: dashboardRoutes.interview,
    accent: "pink" as const,
    emoji: "🎤",
  },
  {
    label: "Chat with notes",
    description: "Ask questions answered by your own material.",
    href: dashboardRoutes.materials,
    accent: "blue" as const,
    emoji: "💬",
  },
  {
    label: "Review flashcards",
    description: "Revise topics with physical study cards.",
    href: dashboardRoutes.flashcards,
    accent: "green" as const,
    emoji: "🃏",
  },
];

/**
 * /dashboard — Dashboard home visual shell.
 */
export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const authError = Array.isArray(params.authError)
    ? params.authError[0]
    : params.authError;

  return (
    <DashboardShell
      title="Your learning desk."
      description="Pick up where you left off. Practice from your own notes."
      activePath={dashboardRoutes.dashboard}
      actions={
        <Button type="button" variant="highlight" size="sm" aria-disabled="true">
          Upload material
        </Button>
      }
    >
      {authError === "admin-required" ? (
        <AuthMessage variant="error">
          You do not have access to the admin area.
        </AuthMessage>
      ) : null}

      {authError === "profile-unavailable" ? (
        <AuthMessage variant="error">
          Your account is signed in, but profile details could not be loaded yet.
        </AuthMessage>
      ) : null}

      {/* First-user empty-state banner */}
      <DashboardEmptyPanel
        emoji="📚"
        title="Start building your learning system."
        description="Upload your first material to start building your learning system. Practice from your own notes with quizzes and interview prompts."
        action={
          <Button type="button" variant="primary" aria-disabled="true">
            Upload your first material
          </Button>
        }
      />

      {/* Stat grid */}
      <section aria-label="Learning stats">
        <h2 className="mb-4 font-heading text-xl font-black">
          Your stats at a glance
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {STAT_CARDS.map((s) => (
            <DashboardStatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section aria-label="Quick actions">
        <h2 className="mb-4 font-heading text-xl font-black">Quick actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <QuickActionCard key={action.label} {...action} />
          ))}
        </div>
      </section>

      {/* Bottom row: recent activity + usage */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivityCard />
        </div>
        <div>
          <UsageCard />
        </div>
      </div>
    </DashboardShell>
  );
}
