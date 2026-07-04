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
import { getRecentMaterials } from "@/lib/materials/queries";

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
  const [params, dashboardResult, recentMaterialsResult] = await Promise.all([
    searchParams ?? Promise.resolve({} as DashboardSearchParams),
    getDashboardProgress(),
    getRecentMaterials(3),
  ]);

  return (
    <DashboardShell
      activePath={dashboardRoutes.dashboard}
      actions={
        <Link
          className="inline-flex items-center justify-center rounded-md border-2 border-black bg-accent-yellow px-4 py-2 text-sm font-black text-ink-text shadow-brutal-sm transition-transform hover:-translate-y-0.5 hover:shadow-brutal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          href={dashboardRoutes.materials}
        >
          Upload material
        </Link>
      }
      description="Track your materials, roadmaps, flashcards, quizzes, interviews, and progress from one protected learning workspace."
      title="Dashboard"
    >
      <AuthMessage auth={params.auth} reason={params.reason} />

      {!dashboardResult.ok ? (
        <ErrorState
          description="Refresh the page or sign in again before checking roadmap and material progress."
          title="Could not load dashboard progress."
        />
      ) : (
        <>
          <section
            aria-label="Dashboard progress summary"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {/* Learning Momentum / Your Study Progress Panel */}
            <div className="brutal-card bg-paper-base p-5 sm:col-span-2 flex flex-col justify-between border-2 border-black shadow-brutal-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600 bg-accent-green/20 px-2 py-0.5 rounded border border-black">
                    Learning Momentum
                  </span>
                  <h3 className="mt-2 font-heading text-xl font-black">Your Study Progress</h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-md border-2 border-black bg-accent-green px-2 text-xs font-black shadow-brutal-sm">
                  📈
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>Overall roadmap completion</span>
                  <span className="font-black text-accent-green">{dashboardResult.data.overall_progress_percentage}%</span>
                </div>
                <div className="h-3 w-full rounded-full border-2 border-black bg-paper-muted overflow-hidden">
                  <div
                    className="h-full bg-accent-green border-r border-black transition-all duration-300"
                    style={{ width: `${dashboardResult.data.overall_progress_percentage}%` }}
                  />
                </div>
                <p className="text-xs font-semibold text-zinc-500">
                  {dashboardResult.data.completed_task_count} of {dashboardResult.data.roadmap_task_count} tasks completed across your roadmaps
                </p>
              </div>
            </div>

            <DashboardStatCard
              accent="yellow"
              label="Learning goals"
              value={dashboardResult.data.learning_goal_count}
              icon="🎯"
            />
            <DashboardStatCard
              accent="blue"
              label="Materials uploaded"
              value={dashboardResult.data.material_count}
              icon="📚"
            />
            <DashboardStatCard
              accent="yellow"
              label="Roadmaps"
              value={dashboardResult.data.roadmap_count}
              icon="🗺️"
            />
            <DashboardStatCard
              accent="pink"
              label="Quiz attempts"
              value={dashboardResult.data.quiz_attempt_count}
              icon="✏️"
            />
            <DashboardStatCard
              accent="pink"
              label="Latest quiz score"
              suffix={dashboardResult.data.latest_quiz_score == null ? undefined : "%"}
              value={dashboardResult.data.latest_quiz_score ?? "-"}
              icon="🏆"
            />
            <DashboardStatCard
              accent="green"
              label="Interviews completed"
              value={dashboardResult.data.completed_interview_count}
              icon="💬"
            />
          </section>

          {dashboardResult.data.learning_goal_count === 0 &&
          dashboardResult.data.material_count === 0 &&
          dashboardResult.data.roadmap_count === 0 &&
          dashboardResult.data.roadmap_task_count === 0 &&
          dashboardResult.data.quiz_attempt_count === 0 &&
          dashboardResult.data.completed_interview_count === 0 ? (
            <DashboardEmptyPanel
              action={
                <Link
                  className="inline-flex items-center justify-center rounded-md border-2 border-black bg-accent-yellow px-4 py-2 text-sm font-black text-ink-text shadow-brutal-sm transition-transform hover:-translate-y-0.5 hover:shadow-brutal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  href={dashboardRoutes.materials}
                >
                  Upload material
                </Link>
              }
              description="Upload your first material or create a learning goal to start building your workspace."
              title="Start your learning workspace."
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
            accent="blue"
            description="Upload PDF/TXT files or paste notes for your study tools."
            emoji="M"
            href={dashboardRoutes.materials}
            label="Upload material"
          />
          <QuickActionCard
            accent="yellow"
            description="Generate a structured roadmap from your notes."
            emoji="+"
            href={dashboardRoutes.roadmaps}
            label="AI Roadmaps"
          />
          <QuickActionCard
            accent="green"
            description="Turn processed materials into flashcards."
            emoji="F"
            href={dashboardRoutes.flashcards}
            label="Flashcards"
          />
          <QuickActionCard
            accent="pink"
            description="Create multiple-choice quizzes from your notes."
            emoji="Q"
            href={dashboardRoutes.quizzes}
            label="Quizzes"
          />
          <QuickActionCard
            accent="blue"
            description="Practice with AI-generated interview questions."
            emoji="I"
            href={dashboardRoutes.interview}
            label="Interview Questions"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <RecentActivityCard
          loadError={!recentMaterialsResult.ok}
          materials={recentMaterialsResult.ok ? recentMaterialsResult.data : []}
        />
        <UsageCard />
      </section>
    </DashboardShell>
  );
}
