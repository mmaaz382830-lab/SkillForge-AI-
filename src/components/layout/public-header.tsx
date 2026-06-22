import Link from "next/link";
import { publicNavigation } from "@/config/navigation";
import { publicRoutes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";
import { AppLogo } from "./app-logo";
import { Container } from "./container";

const linkClasses =
  "rounded-md px-3 py-2 text-sm font-black no-underline hover:bg-accent-yellow";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-black bg-paper-base">
      <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
        <AppLogo href={publicRoutes.home} />
        <nav
          aria-label="Public navigation"
          className="flex flex-wrap items-center gap-2"
        >
          {publicNavigation.map((item) => (
            <Link className={linkClasses} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <Link
            className={cn(
              "pressable inline-flex min-h-11 items-center justify-center rounded-md bg-accent-yellow px-4 py-2.5 text-sm font-black leading-none no-underline hover:bg-accent-yellow",
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
