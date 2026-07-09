"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { AppLogo } from "./app-logo";

type NavItem = {
  readonly label: string;
  readonly href: string;
};

type DashboardNavClientProps = {
  isAdmin: boolean;
  activePath?: string;
  dashboardNavigation: readonly NavItem[];
  adminNavigation: readonly NavItem[];
};

export function DashboardNavClient({
  isAdmin,
  activePath,
  dashboardNavigation,
  adminNavigation,
}: DashboardNavClientProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  // Close mobile navigation panel when route path changes
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  const currentPath = activePath || pathname;

  return (
    <div className="flex flex-col w-full min-w-0">
      {/* Mobile Top Dashboard Header (logo + Menu button) */}
      <div className="flex min-w-0 items-center justify-between gap-3 p-4 lg:hidden">
        <AppLogo className="min-w-0" markSize="sm" />
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border-2 border-black bg-paper-base px-3 text-sm font-black shadow-brutal-sm transition-transform hover:bg-accent-yellow active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          {isOpen ? "Close Menu" : "Menu ☰"}
        </button>
      </div>

      {/* Mobile Stacked Navigation Drawer Panel */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-200 ease-in-out",
          isOpen ? "max-h-[85vh] border-t-2 border-black p-4 opacity-100" : "max-h-0 opacity-0 pointer-events-none p-0 border-t-0"
        )}
      >
        <nav aria-label="Mobile dashboard navigation" className="grid gap-2.5">
          {dashboardNavigation.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "block w-full min-w-0 whitespace-normal break-words rounded-md border-2 border-black px-4 py-3 text-base font-black no-underline shadow-brutal-sm hover:bg-accent-yellow active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
                  isActive ? "bg-accent-yellow" : "bg-paper-base"
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {isAdmin && (
          <div className="grid gap-2.5 border-t-2 border-black mt-4 pt-4">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-500 px-1">
              Admin Control
            </span>
            <nav aria-label="Mobile admin navigation" className="grid gap-2.5">
              {adminNavigation.map((item) => {
                const isActive = currentPath === item.href;
                return (
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "block w-full min-w-0 whitespace-normal break-words rounded-md border-2 border-black px-4 py-3 text-base font-black no-underline shadow-brutal-sm hover:bg-accent-yellow active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
                      isActive ? "bg-accent-yellow" : "bg-paper-base"
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Desktop Sidebar Navigation (unchanged layouts/paddings on desktop) */}
      <div className="hidden lg:grid gap-5 p-5">
        <AppLogo />
        <nav aria-label="Desktop dashboard navigation" className="grid gap-2">
          {dashboardNavigation.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-md border-2 border-black px-3 py-2 text-sm font-black no-underline shadow-brutal-sm hover:bg-accent-yellow w-full active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
                  isActive ? "bg-accent-yellow" : "bg-paper-base"
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {isAdmin && (
          <div className="grid gap-2 border-t-2 border-black pt-4">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-500 px-1">
              Admin Control
            </span>
            <nav aria-label="Desktop admin navigation" className="grid gap-2">
              {adminNavigation.map((item) => {
                const isActive = currentPath === item.href;
                return (
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "whitespace-nowrap rounded-md border-2 border-black px-3 py-2 text-sm font-black no-underline shadow-brutal-sm hover:bg-accent-yellow w-full active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
                      isActive ? "bg-accent-yellow" : "bg-paper-base"
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
