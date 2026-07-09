import Link from "next/link";
import { publicNavigation } from "@/config/navigation";
import { publicRoutes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";
import { AppLogo } from "./app-logo";
import { Container } from "./container";

const linkClasses =
  "rounded-md px-2.5 py-2 text-sm font-black no-underline transition-all duration-200 hover-highlight-yellow sm:px-3";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-black bg-paper-base">
      <Container className="flex min-w-0 flex-col items-stretch gap-2 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:py-4">
        <AppLogo href={publicRoutes.home} />
        <nav
          aria-label="Public navigation"
          className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2"
        >
          {publicNavigation.map((item) => (
            <Link className={linkClasses} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <Link
            className={cn(
              "pressable inline-flex min-h-10 items-center justify-center rounded-md bg-accent-yellow px-3 py-2 text-sm font-black leading-none no-underline hover:bg-accent-yellow sm:min-h-11 sm:px-4 sm:py-2.5",
            )}
            href={publicRoutes.signup}
          >
            Start Free
          </Link>
        </nav>
      </Container>
    </header>
  );
}
