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
  Tabs,
} from "@/components/ui";
import { adminRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { getAdminLogs } from "@/lib/admin/queries";

export const metadata: Metadata = {
  title: `Admin System Logs — ${siteConfig.name}`,
  description: "Review system API logs, errors, and administrative actions.",
};

export default async function AdminLogsPage() {
  const data = await getAdminLogs();

  // Create API Logs Tab content
  const apiLogsContent = (
    <div>
      <h4 className="font-heading text-lg font-black mb-3">API Logs ({data.apiLogs.length})</h4>
      {data.apiLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-black border-dashed bg-paper-muted py-12 px-4 rounded-lg text-center">
          <p className="text-sm font-black uppercase text-zinc-500">No API logs available</p>
        </div>
      ) : (
        <>
          <MobileDataList>
            {data.apiLogs.map((log) => (
              <MobileDataCard key={log.id}>
                <dl className="grid min-w-0 grid-cols-2 gap-3">
                  <MobileDataField className="col-span-2" label="User / caller">
                    <span className="break-words [overflow-wrap:anywhere]">
                      {log.profiles?.email ?? log.user_id ?? "Anonymous"}
                    </span>
                  </MobileDataField>
                  <MobileDataField className="col-span-2" label="Route / method">
                    <span className="break-words font-mono text-xs [overflow-wrap:anywhere]">
                      <strong className="mr-2 inline-block rounded border-2 border-black bg-paper-muted px-1.5 py-0.5 uppercase">
                        {log.method ?? "POST"}
                      </strong>
                      {log.route}
                    </span>
                  </MobileDataField>
                  <MobileDataField label="Feature">
                    {log.feature_type ? <Badge variant="blue">{log.feature_type}</Badge> : "—"}
                  </MobileDataField>
                  <MobileDataField label="Status">
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
                  </MobileDataField>
                  <MobileDataField label="Code">{log.status_code ?? "—"}</MobileDataField>
                  <MobileDataField label="Latency">
                    {log.duration_ms !== null ? `${log.duration_ms}ms` : "—"}
                  </MobileDataField>
                  <MobileDataField className="col-span-2" label="Created">
                    {new Date(log.created_at).toLocaleString()}
                  </MobileDataField>
                </dl>
              </MobileDataCard>
            ))}
          </MobileDataList>
          <div className="hidden min-w-0 md:block">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User / Caller</TableHead>
              <TableHead>Route / Method</TableHead>
              <TableHead>Feature</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Latency</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.apiLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="break-all">
                  {log.profiles?.email ?? log.user_id ?? "Anonymous"}
                </TableCell>
                <TableCell className="break-all font-mono text-xs">
                  <span className="font-black px-1.5 py-0.5 border-2 border-black bg-paper-muted rounded mr-2 uppercase">
                    {log.method ?? "POST"}
                  </span>
                  {log.route}
                </TableCell>
                <TableCell>
                  {log.feature_type ? <Badge variant="blue">{log.feature_type}</Badge> : "—"}
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
                  {log.status_code ?? "—"}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {log.duration_ms !== null ? `${log.duration_ms}ms` : "—"}
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
          </div>
        </>
      )}
    </div>
  );

  // Create Error Logs Tab content
  const errorLogsContent = (
    <div>
      <h4 className="font-heading text-lg font-black mb-3">Error Logs ({data.errorLogs.length})</h4>
      {data.errorLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-black border-dashed bg-paper-muted py-12 px-4 rounded-lg text-center">
          <p className="text-sm font-black uppercase text-zinc-500">No error logs available</p>
        </div>
      ) : (
        <>
          <MobileDataList>
            {data.errorLogs.map((log) => (
              <MobileDataCard key={log.id}>
                <dl className="grid min-w-0 grid-cols-2 gap-3">
                  <MobileDataField label="Severity">
                    <Badge variant={log.severity === "error" ? "error" : "warning"}>
                      {log.severity}
                    </Badge>
                  </MobileDataField>
                  <MobileDataField label="Feature">
                    {log.feature_type ? <Badge variant="blue">{log.feature_type}</Badge> : "—"}
                  </MobileDataField>
                  <MobileDataField className="col-span-2" label="User">
                    <span className="break-words [overflow-wrap:anywhere]">
                      {log.profiles?.email ?? log.user_id ?? "System"}
                    </span>
                  </MobileDataField>
                  <MobileDataField className="col-span-2" label="Category / source">
                    <span className="block font-black uppercase text-zinc-600">{log.category}</span>
                    {log.source ? (
                      <span className="block break-words font-mono text-xs [overflow-wrap:anywhere]">
                        {log.source}
                      </span>
                    ) : null}
                  </MobileDataField>
                  <MobileDataField className="col-span-2" label="Safe message">
                    {log.safe_message}
                  </MobileDataField>
                  <MobileDataField className="col-span-2" label="Created">
                    {new Date(log.created_at).toLocaleString()}
                  </MobileDataField>
                </dl>
              </MobileDataCard>
            ))}
          </MobileDataList>
          <div className="hidden min-w-0 md:block">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Severity</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Category / Source</TableHead>
              <TableHead>Feature</TableHead>
              <TableHead>Safe Message</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.errorLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Badge variant={log.severity === "error" ? "error" : "warning"}>
                    {log.severity}
                  </Badge>
                </TableCell>
                <TableCell className="break-all text-xs">
                  {log.profiles?.email ?? log.user_id ?? "System"}
                </TableCell>
                <TableCell className="text-xs">
                  <div className="font-black uppercase text-zinc-500">{log.category}</div>
                  {log.source && (
                    <div className="font-mono text-[10px] text-zinc-400 break-all">{log.source}</div>
                  )}
                </TableCell>
                <TableCell>
                  {log.feature_type ? <Badge variant="blue">{log.feature_type}</Badge> : "—"}
                </TableCell>
                <TableCell className="max-w-md font-semibold text-zinc-800 break-words">
                  {log.safe_message}
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
          </div>
        </>
      )}
    </div>
  );

  // Create Admin Actions Tab content
  const adminActionsContent = (
    <div>
      <h4 className="font-heading text-lg font-black mb-3">Admin Actions ({data.adminActions.length})</h4>
      {data.adminActions.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-black border-dashed bg-paper-muted py-12 px-4 rounded-lg text-center">
          <p className="text-sm font-black uppercase text-zinc-500">No admin actions recorded</p>
        </div>
      ) : (
        <>
          <MobileDataList>
            {data.adminActions.map((log) => (
              <MobileDataCard key={log.id}>
                <dl className="grid min-w-0 grid-cols-2 gap-3">
                  <MobileDataField className="col-span-2" label="Admin user">
                    <span className="break-words [overflow-wrap:anywhere]">
                      {log.admin_profiles?.email ?? log.admin_user_id ?? "Unknown Admin"}
                    </span>
                  </MobileDataField>
                  <MobileDataField className="col-span-2" label="Action">
                    <Badge variant="yellow">{log.action}</Badge>
                  </MobileDataField>
                  <MobileDataField className="col-span-2" label="Target user">
                    <span className="break-words [overflow-wrap:anywhere]">
                      {log.target_profiles?.email ?? log.target_user_id ?? "—"}
                    </span>
                  </MobileDataField>
                  <MobileDataField label="Target type">
                    {log.target_type ?? "—"}
                  </MobileDataField>
                  <MobileDataField label="Target ID">
                    <span className="break-words font-mono text-xs [overflow-wrap:anywhere]">
                      {log.target_id ?? "—"}
                    </span>
                  </MobileDataField>
                  <MobileDataField className="col-span-2" label="Created">
                    {new Date(log.created_at).toLocaleString()}
                  </MobileDataField>
                </dl>
              </MobileDataCard>
            ))}
          </MobileDataList>
          <div className="hidden min-w-0 md:block">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target User</TableHead>
              <TableHead>Target Details</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.adminActions.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="break-all font-semibold">
                  {log.admin_profiles?.email ?? log.admin_user_id ?? "Unknown Admin"}
                </TableCell>
                <TableCell>
                  <span className="rounded border-2 border-black bg-accent-yellow px-2 py-0.5 text-xs font-black uppercase shadow-brutal-sm">
                    {log.action}
                  </span>
                </TableCell>
                <TableCell className="break-all text-xs">
                  {log.target_profiles?.email ?? log.target_user_id ?? "—"}
                </TableCell>
                <TableCell className="text-xs">
                  {log.target_type && (
                    <div className="font-bold text-zinc-600">Type: {log.target_type}</div>
                  )}
                  {log.target_id && (
                    <div className="font-mono text-[10px] text-zinc-400">ID: {log.target_id}</div>
                  )}
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
          </div>
        </>
      )}
    </div>
  );

  // Define tab configuration
  const tabItems = [
    { id: "api", label: "API Logs", content: apiLogsContent },
    { id: "errors", label: "Error Logs", content: errorLogsContent },
    { id: "actions", label: "Admin Actions", content: adminActionsContent },
  ];

  return (
    <DashboardShell
      activePath={adminRoutes.logs}
      description="View recent system runtime logs, exceptions, and logged admin audit operations."
      title="System Audit Logs"
    >
      <div className="w-full min-w-0 max-w-full">
        <Tabs items={tabItems} defaultValue="api" />
      </div>
    </DashboardShell>
  );
}
