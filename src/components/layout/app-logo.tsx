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
  sm: "h-10 w-10",
  md: "h-11 w-11",
} as const;

export function AppLogo({
  href = publicRoutes.home,
  compact = false,
  className,
  markSize = "md",
}: AppLogoProps) {
  const content = (
    <span className="inline-flex items-center gap-3 align-middle">
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

