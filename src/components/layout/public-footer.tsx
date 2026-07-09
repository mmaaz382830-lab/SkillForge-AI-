import Link from "next/link";
import { publicNavigation } from "@/config/navigation";
import { publicRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { AppLogo } from "./app-logo";
import { Container } from "./container";

export function PublicFooter() {
  return (
    <footer className="border-t-2 border-black bg-paper-muted">
      <Container className="grid min-w-0 gap-5 py-7 md:grid-cols-[1.5fr_1fr] md:items-start md:py-8">
        <div className="grid gap-3">
          <AppLogo href={publicRoutes.home} markSize="sm" />
          <p className="text-sm font-medium leading-7 sm:text-base">
            {siteConfig.description} Built for studying from notes, practicing
            interviews, and tracking learning progress.
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="flex min-w-0 flex-wrap gap-2 md:justify-end"
        >
          {publicNavigation.map((item) => (
            <Link
              className="rounded-md px-2.5 py-2 text-sm font-black no-underline transition-all duration-200 hover-highlight-yellow sm:px-3"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}

