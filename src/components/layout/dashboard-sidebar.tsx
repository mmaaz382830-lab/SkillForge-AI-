import { adminNavigation, dashboardNavigation } from "@/config/navigation";
import { getCurrentAdminProfile } from "@/lib/admin/access";
import { cn } from "@/lib/utils/cn";
import { DashboardNavClient } from "./dashboard-nav-client";

type DashboardSidebarProps = {
  activePath?: string;
  className?: string;
};

export async function DashboardSidebar({
  activePath,
  className,
}: DashboardSidebarProps) {
  const adminProfile = await getCurrentAdminProfile();
  const isAdmin = !!adminProfile;

  return (
    <aside
      className={cn(
        "w-full border-b-2 border-black bg-paper-muted lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r-2",
        className,
      )}
    >
      <DashboardNavClient
        activePath={activePath}
        adminNavigation={adminNavigation}
        dashboardNavigation={dashboardNavigation}
        isAdmin={isAdmin}
      />
    </aside>
  );
}
