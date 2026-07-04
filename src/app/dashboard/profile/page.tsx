import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { dashboardRoutes, publicRoutes } from "@/config/routes";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { signOutAndRedirect } from "@/lib/auth/actions";
import { ProfileDisplayNameForm } from "@/features/auth/components/profile-display-name-form";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: `Profile — ${siteConfig.name}`,
  description: "Your SkillForge AI learning profile and account information.",
};

function formatPlan(plan?: string | null) {
  if (!plan) {
    return "Unknown";
  }

  return plan
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default async function ProfilePage() {
  const [user, profile] = await Promise.all([
    getCurrentUser(),
    getCurrentProfile(),
  ]);
  const displayName =
    profile?.full_name ||
    user?.user_metadata.full_name ||
    user?.user_metadata.name ||
    "Signed-out learner";
  const email = profile?.email || user?.email || "Sign in to view email";
  const role = profile?.role ?? "user";
  const plan = profile?.plan ?? "free";
  const createdAt = profile?.created_at ?? user?.created_at ?? null;
  const initials = getInitials(displayName) || "SF";

  return (
    <DashboardShell
      title="Profile"
      description="Your account details and learning identity."
      activePath={dashboardRoutes.profile}
    >
      {/* Profile card */}
      <section className="brutal-card p-6 sm:p-8" aria-label="Profile information">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar chip */}
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-accent-yellow font-heading text-3xl font-black shadow-brutal-sm"
            aria-label="User avatar"
          >
            {initials}
          </div>
          {/* Info */}
          <div className="grid gap-3">
            <div>
              <h2 className="font-heading text-3xl font-black leading-tight">
                {displayName}
              </h2>
              <p className="mt-1 text-base font-semibold text-zinc-600">
                {email}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="neutral">{role}</Badge>
              <Badge variant="yellow">{formatPlan(plan)} plan</Badge>
            </div>
            <p className="text-sm font-medium text-zinc-500">
              {user
                ? `Member since ${formatDate(createdAt)}.`
                : "Sign in to load your saved profile."}
            </p>
          </div>
        </div>
      </section>

      {/* Account info card */}
      <section className="brutal-card p-5 sm:p-6" aria-label="Account details">
        <h2 className="mb-4 font-heading text-xl font-black">
          Account details
        </h2>
        <div className="grid gap-3">
          {[
            { label: "Display name", value: displayName },
            { label: "Email", value: email },
            { label: "Role", value: role },
            { label: "Plan", value: formatPlan(plan) },
            { label: "Account created", value: formatDate(createdAt) },
          ].map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-1 rounded-md border-2 border-black bg-paper-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-black uppercase tracking-wide text-zinc-500">
                {row.label}
              </span>
              <span className="text-sm font-semibold">{row.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section
        className="brutal-card border-state-error p-5 sm:p-6"
        aria-label="Account actions"
      >
        <h2 className="mb-4 font-heading text-xl font-black">Account actions</h2>
        <div className="grid gap-5">
          <ProfileDisplayNameForm displayName={displayName} />
          <div className="flex flex-wrap gap-3 border-t-2 border-black pt-4">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border-2 border-black bg-paper-base px-4 py-2.5 text-base font-black leading-none no-underline shadow-brutal-sm transition hover:bg-accent-yellow"
              href={publicRoutes.forgotPassword}
            >
              Reset password
            </Link>
            <form action={signOutAndRedirect}>
              <Button
                type="submit"
                variant="ghost"
                className="text-state-error hover:bg-accent-pink"
              >
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
