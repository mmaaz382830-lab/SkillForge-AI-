import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { adminRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { getAdminUsageLogs } from "@/lib/admin/queries";

export const metadata: Metadata = {
  title: `Admin Usage Logs — ${siteConfig.name}`,
  description: "Monitor AI tool and endpoint usage details.",
};

export default async function AdminUsagePage() {
  const usageLogs = await getAdminUsageLogs();

  // Simple count aggregations for the current visible logs
  const countsByFeature: Record<string, number> = {};
  const countsByStatus: Record<string, number> = {};

  usageLogs.forEach((log) => {
    countsByFeature[log.feature_type] = (countsByFeature[log.feature_type] || 0) + 1;
    countsByStatus[log.status] = (countsByStatus[log.status] || 0) + 1;
  });

  return (
    <DashboardShell
      activePath={adminRoutes.usage}
      description="Historical log of AI generator usage events, rate limit hits, and statuses."
      title="Usage Analytics"
    >
      {/* Aggregation Cards */}
      {usageLogs.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Feature Distribution */}
          <div className="brutal-card bg-paper-base p-6">
            <h4 className="font-heading text-lg font-black mb-3">Feature Distribution</h4>
            <div className="flex flex-wrap gap-3">
              {Object.entries(countsByFeature).map(([feature, count]) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 border-2 border-black bg-paper-muted px-3 py-1.5 rounded-md"
                >
                  <Badge variant="blue">{feature}</Badge>
                  <span className="text-sm font-black">× {count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="brutal-card bg-paper-base p-6">
            <h4 className="font-heading text-lg font-black mb-3">Status Distribution</h4>
            <div className="flex flex-wrap gap-3">
              {Object.entries(countsByStatus).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center gap-2 border-2 border-black bg-paper-muted px-3 py-1.5 rounded-md"
                >
                  <Badge
                    variant={
                      status === "success"
                        ? "success"
                        : status === "blocked"
                        ? "warning"
                        : "error"
                    }
                  >
                    {status}
                  </Badge>
                  <span className="text-sm font-black">× {count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="brutal-card bg-paper-base p-6">
        <h3 className="font-heading text-xl font-black mb-4">
          Recent Usage Events ({usageLogs.length})
        </h3>

        {usageLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-black border-dashed bg-paper-muted py-12 px-4 rounded-lg text-center">
            <p className="text-base font-black uppercase text-zinc-500">
              No usage logs available
            </p>
            <p className="text-sm text-zinc-400 mt-1">
              Events will be logged as users run queries and actions.
            </p>
          </div>
        ) : (
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Email</TableHead>
                  <TableHead>Feature Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period Key</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="break-all">
                      {log.profiles?.email ?? log.user_id ?? "Anonymous"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="blue">{log.feature_type}</Badge>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.period_key}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
