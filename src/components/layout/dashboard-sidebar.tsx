import Link from "next/link";
import { Badge } from "@/components/ui";
import { adminNavigation, dashboardNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils/cn";
import { AppLogo } from "./app-logo";

type DashboardSidebarProps = {
  activePath?: string;
  className?: string;
};

export function DashboardSidebar({
  activePath,
  className,
}: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        "w-full border-b-2 border-black bg-paper-muted lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r-2",
        className,
      )}
    >
      <div className="grid gap-5 p-4 sm:p-5">
        <AppLogo compact className="lg:hidden" />
        <AppLogo className="hidden lg:inline-flex" />
        <nav aria-label="Dashboard navigation" className="grid gap-2">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0">
            {dashboardNavigation.map((item) => {
              const isActive = activePath === item.href;

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "whitespace-nowrap rounded-md border-2 border-black px-3 py-2 text-sm font-black no-underline shadow-brutal-sm hover:bg-accent-yellow lg:w-full",
                    isActive ? "bg-accent-yellow" : "bg-paper-base",
                  )}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="grid gap-2 border-t-2 border-black pt-4">
          <Badge variant="blue">Visual placeholder</Badge>
          {adminNavigation.map((item) => (
            <Link
              className="w-fit rounded-md border-2 border-black bg-paper-base px-3 py-2 text-sm font-black no-underline shadow-brutal-sm hover:bg-accent-yellow"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
