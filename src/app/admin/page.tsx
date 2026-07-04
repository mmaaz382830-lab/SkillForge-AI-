import type { Metadata } from "next";
import Link from "next/link";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { adminRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { getAdminOverview } from "@/lib/admin/queries";

export const metadata: Metadata = {
  title: `Admin Overview — ${siteConfig.name}`,
  description: "SkillForge AI admin control layer overview.",
};

function formatPlan(plan: string) {
  return plan
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export default async function AdminPage() {
  const data = await getAdminOverview();

  // Find any blocked requests in recent API logs
  const blockedRequests = data.recentApiLogs.filter((log) => log.status === "blocked");

  return (
    <DashboardShell
      activePath={adminRoutes.admin}
      description="Protected admin area for monitoring users, usage activity, and logs."
      title="Admin Control"
    >
      {/* Overview Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="brutal-card bg-paper-base p-6">
          <span className="text-sm font-black uppercase tracking-wider text-zinc-500">
            Total Users
          </span>
          <p className="mt-2 font-heading text-4xl font-black">{data.totalUsers}</p>
        </div>

        <div className="brutal-card bg-paper-base p-6">
          <span className="text-sm font-black uppercase tracking-wider text-zinc-500">
            Usage Events
          </span>
          <p className="mt-2 font-heading text-4xl font-black">{data.usageEventsCount}</p>
        </div>

        <div className="brutal-card bg-paper-base p-6">
          <span className="text-sm font-black uppercase tracking-wider text-zinc-500">
            API Logs
          </span>
          <p className="mt-2 font-heading text-4xl font-black">{data.apiLogCount}</p>
        </div>

        <div className="brutal-card bg-paper-base p-6">
          <span className="text-sm font-black uppercase tracking-wider text-zinc-500">
            Error Logs
          </span>
          <p className="mt-2 font-heading text-4xl font-black">{data.errorLogCount}</p>
        </div>
      </div>

      {/* Distributions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="brutal-card bg-paper-base p-6">
          <h3 className="font-heading text-xl font-black mb-4">Plan Distribution</h3>
          <div className="grid gap-3">
            {[
              { name: "free", count: data.planDistribution.free, variant: "neutral" as const },
              { name: "pro", count: data.planDistribution.pro, variant: "green" as const },
              { name: "demo_admin", count: data.planDistribution.demo_admin, variant: "blue" as const },
            ].map((plan) => (
              <div
                key={plan.name}
                className="flex items-center justify-between border-2 border-black bg-paper-muted px-4 py-2 rounded-md"
              >
                <Badge variant={plan.variant}>{formatPlan(plan.name)}</Badge>
                <span className="text-lg font-black">{plan.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="brutal-card bg-paper-base p-6">
          <h3 className="font-heading text-xl font-black mb-4">Role Distribution</h3>
          <div className="grid gap-3">
            {[
              { name: "user", count: data.roleDistribution.user, variant: "neutral" as const },
              { name: "admin", count: data.roleDistribution.admin, variant: "yellow" as const },
              { name: "blocked", count: data.roleDistribution.blocked, variant: "error" as const },
            ].map((role) => (
              <div
                key={role.name}
                className="flex items-center justify-between border-2 border-black bg-paper-muted px-4 py-2 rounded-md"
              >
                <Badge variant={role.variant}>{role.name}</Badge>
                <span className="text-lg font-black">{role.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Error Logs */}
        <div className="brutal-card bg-paper-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-xl font-black">Recent Errors</h3>
            <Link
              href={adminRoutes.logs}
              className="text-xs font-black uppercase underline hover:text-zinc-600"
            >
              All Logs
            </Link>
          </div>
          {data.recentErrors.length === 0 ? (
            <p className="text-sm font-semibold text-zinc-500 py-4 bg-paper-muted border-2 border-black border-dashed rounded-md text-center">
              No recent errors logged.
            </p>
          ) : (
            <div className="grid gap-3">
              {data.recentErrors.map((error) => (
                <div
                  key={error.id}
                  className="grid gap-1 border-2 border-black bg-paper-muted p-4 rounded-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={error.severity === "error" ? "error" : "warning"}>
                      {error.severity}
                    </Badge>
                    <span className="text-[10px] font-black text-zinc-500">
                      {new Date(error.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs font-black uppercase text-zinc-500 mt-1">
                    Category: {error.category}
                  </p>
                  <p className="text-sm font-semibold text-zinc-800 break-words">
                    {error.safe_message}
                  </p>
                  {error.source && (
                    <span className="text-[11px] font-bold text-zinc-400">
                      Source: {error.source}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Blocked / API Events */}
        <div className="brutal-card bg-paper-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-xl font-black">Recent API Activities</h3>
            <Link
              href={adminRoutes.logs}
              className="text-xs font-black uppercase underline hover:text-zinc-600"
            >
              All Logs
            </Link>
          </div>
          
          {data.recentApiLogs.length === 0 ? (
            <p className="text-sm font-semibold text-zinc-500 py-4 bg-paper-muted border-2 border-black border-dashed rounded-md text-center">
              No recent API logs.
            </p>
          ) : (
            <div className="grid gap-3">
              {data.recentApiLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col gap-2 border-2 border-black bg-paper-muted p-4 rounded-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-1.5 py-0.5 border-2 border-black bg-paper-base uppercase">
                        {log.method ?? "POST"}
                      </span>
                      <span className="text-sm font-semibold text-zinc-800 break-all">
                        {log.route}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-zinc-500">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        log.status === "success"
                          ? "success"
                          : log.status === "blocked"
                          ? "warning"
                          : "error"
                      }
                    >
                      {log.status}
                    </Badge>
                    {log.status_code && (
                      <span className="text-xs font-bold text-zinc-600">
                        HTTP {log.status_code}
                      </span>
                    )}
                    {log.duration_ms !== null && (
                      <span className="text-xs font-bold text-zinc-500">
                        {log.duration_ms}ms
                      </span>
                    )}
                    {log.feature_type && (
                      <Badge variant="blue">{log.feature_type}</Badge>
                    )}
                  </div>
                </div>
              ))}

              {blockedRequests.length > 0 && (
                <div className="mt-2 border-2 border-black bg-accent-yellow p-4 rounded-md shadow-brutal-sm">
                  <span className="text-xs font-black uppercase text-ink-text block">
                    Security Layer Alert
                  </span>
                  <p className="text-sm font-bold text-ink-text mt-1">
                    {blockedRequests.length} blocked request(s) detected in recent activity.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}