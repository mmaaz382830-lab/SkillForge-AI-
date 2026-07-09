import Image from "next/image";
import Link from "next/link";
import { publicRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

type AppLogoProps = {
  href?: string;
  compact?: boolean;
  className?: string;
  markSize?: "sm" | "md";
};

const markSizeClasses = {
  sm: "h-9 w-9 sm:h-10 sm:w-10",
  md: "h-10 w-10 sm:h-11 sm:w-11",
} as const;

export function AppLogo({
  href = publicRoutes.home,
  compact = false,
  className,
  markSize = "md",
}: AppLogoProps) {
  const content = (
    <span className="inline-flex min-w-0 items-center gap-2 align-middle sm:gap-3">
      <span
        className={cn(
          "relative block shrink-0 overflow-hidden rounded-md",
          markSizeClasses[markSize],
        )}
      >
        <Image
          alt="SkillForge AI logo"
          className="h-full w-full object-contain"
          height={96}
          src="/brand/skillforge-logo.png"
          width={96}
        />
      </span>
      {!compact ? (
        <span className="grid min-w-0 leading-none">
          <span className="font-heading text-lg font-black tracking-normal sm:text-xl">
            {siteConfig.name}
          </span>
          <span className="text-[0.65rem] font-black uppercase tracking-normal sm:text-xs">
            Learning system
          </span>
        </span>
      ) : null}
    </span>
  );

  const classes = cn(
    "inline-flex min-w-0 max-w-full items-center rounded-md text-ink-text no-underline hover:bg-transparent",
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

