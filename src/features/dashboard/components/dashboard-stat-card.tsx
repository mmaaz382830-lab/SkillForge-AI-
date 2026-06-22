import { cn } from "@/lib/utils/cn";

type DashboardStatCardProps = {
  label: string;
  value: string | number;
  accent?: "yellow" | "green" | "pink" | "blue" | "neutral";
  suffix?: string;
  className?: string;
};

const accentMap: Record<NonNullable<DashboardStatCardProps["accent"]>, string> =
  {
    yellow: "bg-accent-yellow",
    green: "bg-accent-green",
    pink: "bg-accent-pink",
    blue: "bg-accent-blue",
    neutral: "bg-paper-muted",
  };

/**
 * DashboardStatCard — compact metric card used in the dashboard home grid.
 * Static data only — no real data fetching.
 */
export function DashboardStatCard({
  label,
  value,
  accent = "neutral",
  suffix,
  className,
}: DashboardStatCardProps) {
  return (
    <div className={cn("brutal-card p-5", className)}>
      <div
        className={cn(
          "mb-3 flex h-10 w-10 items-center justify-center rounded-md border-2 border-black text-sm font-black shadow-brutal-sm",
          accentMap[accent],
        )}
        aria-hidden="true"
      >
        #
      </div>
      <p className="text-3xl font-black leading-none">
        {value}
        {suffix ? (
          <span className="ml-1 text-lg font-black">{suffix}</span>
        ) : null}
      </p>
      <p className="mt-2 text-sm font-semibold text-zinc-600">{label}</p>
    </div>
  );
}
