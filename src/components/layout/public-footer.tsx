import Link from "next/link";
import { publicNavigation } from "@/config/navigation";
import { publicRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { AppLogo } from "./app-logo";
import { Container } from "./container";

export function PublicFooter() {
  return (
    <footer className="border-t-2 border-black bg-paper-muted">
      <Container className="grid gap-6 py-8 md:grid-cols-[1.5fr_1fr] md:items-start">
        <div className="grid gap-3">
          <AppLogo href={publicRoutes.home} />
          <p className="font-medium leading-7">
            {siteConfig.description} Built for studying from notes, practicing
            interviews, and tracking learning progress.
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-3 md:justify-end"
        >
          {publicNavigation.map((item) => (
            <Link
              className="rounded-md px-3 py-2 text-sm font-black no-underline hover:bg-accent-yellow"
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
