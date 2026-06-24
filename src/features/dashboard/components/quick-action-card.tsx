import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type QuickActionCardProps = {
  label: string;
  description: string;
  href: string;
  accent?: "yellow" | "green" | "pink" | "blue";
  emoji: string;
};

const accentMap: Record<
  NonNullable<QuickActionCardProps["accent"]>,
  string
> = {
  yellow: "bg-accent-yellow",
  green: "bg-accent-green",
  pink: "bg-accent-pink",
  blue: "bg-accent-blue",
};

/**
 * QuickActionCard — color-coded action card linking to a dashboard feature.
 * Route link card. Callers label future-phase actions explicitly when they are placeholders.
 */
export function QuickActionCard({
  label,
  description,
  href,
  accent = "yellow",
  emoji,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "liftable brutal-card block p-5 no-underline hover:bg-paper-muted",
      )}
      aria-label={label}
    >
      <div
        className={cn(
          "mb-3 flex h-11 w-11 items-center justify-center rounded-md border-2 border-black text-xl shadow-brutal-sm",
          accentMap[accent],
        )}
        aria-hidden="true"
      >
        {emoji}
      </div>
      <p className="font-heading text-lg font-black leading-tight">{label}</p>
      <p className="mt-1 text-sm font-medium text-zinc-600">{description}</p>
    </Link>
  );
}

