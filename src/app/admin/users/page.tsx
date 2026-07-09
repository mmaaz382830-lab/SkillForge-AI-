import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  Badge,
  MobileDataCard,
  MobileDataField,
  MobileDataList,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { adminRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { getAdminUsers } from "@/lib/admin/queries";

export const metadata: Metadata = {
  title: `Admin Users — ${siteConfig.name}`,
  description: "Manage registered users in the admin control layer.",
};

function formatPlan(plan: string) {
  return plan
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <DashboardShell
      activePath={adminRoutes.users}
      description="Registered user profiles, roles, subscription plans, and activity status."
      title="User Management"
    >
      <div className="brutal-card min-w-0 bg-paper-base p-4 sm:p-6">
        <h3 className="font-heading text-xl font-black mb-4">
          All Users ({users.length})
        </h3>

        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-black border-dashed bg-paper-muted py-12 px-4 rounded-lg text-center">
            <p className="text-base font-black uppercase text-zinc-500">
              No registered profiles found
            </p>
            <p className="text-sm text-zinc-400 mt-1">
              Verify database connection or wait for users to register.
            </p>
          </div>
        ) : (
          <>
            <MobileDataList>
              {users.map((user) => (
                <MobileDataCard key={user.id}>
                  <dl className="grid min-w-0 grid-cols-2 gap-3">
                    <MobileDataField className="col-span-2" label="Email">
                      <span className="break-words [overflow-wrap:anywhere]">{user.email}</span>
                    </MobileDataField>
                    <MobileDataField className="col-span-2" label="Full name">
                      {user.full_name ?? "—"}
                    </MobileDataField>
                    <MobileDataField label="Role">
                      <Badge
                        variant={
                          user.role === "admin"
                            ? "yellow"
                            : user.role === "blocked"
                              ? "error"
                              : "neutral"
                        }
                      >
                        {user.role}
                      </Badge>
                    </MobileDataField>
                    <MobileDataField label="Plan">
                      <Badge
                        variant={
                          user.plan === "pro"
                            ? "green"
                            : user.plan === "demo_admin"
                              ? "blue"
                              : "neutral"
                        }
                      >
                        {formatPlan(user.plan)}
                      </Badge>
                    </MobileDataField>
                    <MobileDataField label="Created">
                      {new Date(user.created_at).toLocaleString()}
                    </MobileDataField>
                    <MobileDataField label="Last active">
                      {user.last_active_at
                        ? new Date(user.last_active_at).toLocaleString()
                        : "Never"}
                    </MobileDataField>
                  </dl>
                </MobileDataCard>
              ))}
            </MobileDataList>
            <div className="hidden w-full min-w-0 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="break-all">{user.email}</TableCell>
                    <TableCell>{user.full_name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin"
                            ? "yellow"
                            : user.role === "blocked"
                            ? "error"
                            : "neutral"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.plan === "pro"
                            ? "green"
                            : user.plan === "demo_admin"
                            ? "blue"
                            : "neutral"
                        }
                      >
                        {formatPlan(user.plan)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(user.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {user.last_active_at
                        ? new Date(user.last_active_at).toLocaleString()
                        : "Never"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
