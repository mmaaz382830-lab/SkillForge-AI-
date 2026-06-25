import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ErrorState } from "@/components/states/error-state";
import { Progress } from "@/components/ui/progress";
import { dashboardRoutes } from "@/config/routes";
import {
  CurrentRoadmapCard,
  DashboardEmptyPanel,
  DashboardStatCard,
  QuickActionCard,
  RecentActivityCard,
  UsageCard,
} from "@/features/dashboard/components";
import { getDashboardProgress } from "@/lib/dashboard/queries";

export const metadata = {
  title: "Dashboard | SkillForge AI",
  description:
    "Your SkillForge AI learning desk. View your materials, roadmaps, quizzes, and progress.",
};

type DashboardSearchParams = {
  auth?: string;
  reason?: string;
};

type DashboardPageProps = {
  searchParams?: Promise<DashboardSearchParams>;
};

function AuthMessage({ auth, reason }: { auth?: string; reason?: string }) {
  if (auth !== "required") {
    return null;
  }

  const message =
    reason === "admin"
      ? "Admin tools require an authorized admin account. You are signed in to the learner dashboard instead."
      : "Sign in to access your SkillForge AI workspace.";

  return (
    <div className="brutal-card border-state-warning bg-accent-yellow p-4 text-sm font-black shadow-brutal-sm">
      {message}
    </div>
  );
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const [params, dashboardResult] = await Promise.all([
    searchParams ?? Promise.resolve({} as DashboardSearchParams),
    getDashboardProgress(),
  ]);

  return (
    <DashboardShell
      activePath={dashboardRoutes.dashboard}
      actions={
        <Link
          className="inline-flex items-center justify-center rounded-md border-2 border-black bg-accent-yellow px-4 py-2 text-sm font-black text-ink-text shadow-brutal-sm transition-transform hover:-translate-y-0.5 hover:shadow-brutal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          href={dashboardRoutes.roadmaps}
        >
          Manage roadmaps
        </Link>
      }
      description="Your protected SkillForge workspace now tracks Day 4 goals, roadmaps, and roadmap task progress. Later learning tools remain clearly marked for upcoming phases."
      title="Dashboard"
    >
      <AuthMessage auth={params.auth} reason={params.reason} />

      {!dashboardResult.ok ? (
        <ErrorState
          description="Refresh the page or sign in again before checking roadmap progress."
          title="Could not load dashboard progress."
        />
      ) : (
        <>
          <section
            aria-label="Day 4 progress summary"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
          >
            <DashboardStatCard
              accent="yellow"
              label="Learning goals"
              value={dashboardResult.data.learning_goal_count}
            />
            <DashboardStatCard
              accent="yellow"
              label="Roadmaps"
              value={dashboardResult.data.roadmap_count}
            />
            <DashboardStatCard
              accent="blue"
              label="Roadmap tasks"
              value={dashboardResult.data.roadmap_task_count}
            />
            <DashboardStatCard
              accent="green"
              label="Tasks completed"
              value={dashboardResult.data.completed_task_count}
            />
            <DashboardStatCard
              accent="green"
              label="Overall roadmap progress"
              suffix="%"
              value={dashboardResult.data.overall_progress_percentage}
            />
          </section>

          {dashboardResult.data.learning_goal_count === 0 &&
          dashboardResult.data.roadmap_count === 0 &&
          dashboardResult.data.roadmap_task_count === 0 ? (
            <DashboardEmptyPanel
              action={
                <Link
                  className="inline-flex items-center justify-center rounded-md border-2 border-black bg-accent-yellow px-4 py-2 text-sm font-black text-ink-text shadow-brutal-sm transition-transform hover:-translate-y-0.5 hover:shadow-brutal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  href={dashboardRoutes.roadmaps}
                >
                  Open roadmaps
                </Link>
              }
              description="Create your first learning goal or roadmap to start tracking progress."
              title="Start tracking progress."
            />
          ) : null}

          <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <CurrentRoadmapCard roadmap={dashboardResult.data.current_roadmap} />

            <div className="brutal-card grid gap-4 bg-paper-base p-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-600">
                  Overall roadmap progress
                </p>
                <h2 className="mt-2 font-heading text-2xl font-black leading-tight">
                  {dashboardResult.data.overall_progress_percentage}% complete
                </h2>
              </div>
              <Progress
                description={`${dashboardResult.data.completed_task_count} of ${dashboardResult.data.roadmap_task_count} roadmap tasks completed across your roadmaps.`}
                indicatorClassName="bg-accent-green"
                label="All roadmap tasks"
                value={dashboardResult.data.overall_progress_percentage}
              />
              <p className="text-sm font-semibold leading-6 text-zinc-600">
                This uses completed tasks divided by total roadmap tasks. Roadmaps
                with zero tasks contribute 0% until tasks are added.
              </p>
            </div>
          </section>
        </>
      )}

      <section aria-labelledby="quick-actions-title" className="grid gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-600">
            Quick actions
          </p>
          <h2
            className="mt-2 font-heading text-2xl font-black leading-tight"
            id="quick-actions-title"
          >
            Build your learning workspace
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <QuickActionCard
            accent="yellow"
            description="Create goals, build roadmaps, and manage roadmap tasks."
            emoji="+"
            href={dashboardRoutes.roadmaps}
            label="Create goal or roadmap"
          />
          <QuickActionCard
            accent="green"
            description="Open your roadmap list and continue task tracking."
            emoji=">"
            href={dashboardRoutes.roadmaps}
            label="Manage roadmaps"
          />
          <QuickActionCard
            accent="blue"
            description="Coming in the next phases. This card does not show live material stats yet."
            emoji="M"
            href={dashboardRoutes.materials}
            label="Materials later"
          />
          <QuickActionCard
            accent="pink"
            description="Coming in a later phase after source material flows exist."
            emoji="F"
            href={dashboardRoutes.flashcards}
            label="Flashcards later"
          />
          <QuickActionCard
            accent="yellow"
            description="Coming later. Quiz attempts are not counted on this dashboard yet."
            emoji="Q"
            href={dashboardRoutes.quizzes}
            label="Quizzes later"
          />
          <QuickActionCard
            accent="blue"
            description="Coming later. Interview practice remains a protected placeholder."
            emoji="I"
            href={dashboardRoutes.interview}
            label="Interview later"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <RecentActivityCard />
        <UsageCard />
      </section>
    </DashboardShell>
  );
}

