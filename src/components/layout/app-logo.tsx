import Link from "next/link";
import { publicRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

type AppLogoProps = {
  href?: string;
  compact?: boolean;
  className?: string;
};

export function AppLogo({
  href = publicRoutes.home,
  compact = false,
  className,
}: AppLogoProps) {
  const content = (
    <span className="inline-flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-black bg-accent-yellow font-heading text-sm font-black shadow-brutal-sm"
      >
        SF
      </span>
      {!compact ? (
        <span className="grid leading-none">
          <span className="font-heading text-xl font-black tracking-normal">
            {siteConfig.name}
          </span>
          <span className="text-xs font-black uppercase tracking-normal">
            Learning system
          </span>
        </span>
      ) : null}
    </span>
  );

  const classes = cn(
    "inline-flex w-fit items-center rounded-md text-ink-text no-underline hover:bg-transparent",
    className,
  );

  if (!href) {
    return <div className={classes}>{content}</div>;
  }

  return (
    <Link className={classes} href={href}>
      {content}
    </Link>
  );
}
