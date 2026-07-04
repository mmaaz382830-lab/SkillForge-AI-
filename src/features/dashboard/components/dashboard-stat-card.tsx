import { cn } from "@/lib/utils/cn";

type DashboardStatCardProps = {
  label: string;
  value: string | number;
  accent?: "yellow" | "green" | "pink" | "blue" | "neutral";
  suffix?: string;
  icon?: string;
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

export function DashboardStatCard({
  label,
  value,
  accent = "neutral",
  suffix,
  icon = "#",
  className,
}: DashboardStatCardProps) {
  return (
    <div className={cn("brutal-card grid gap-4 p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 min-w-11 items-center justify-center rounded-md border-2 border-black px-2 text-xs font-black uppercase shadow-brutal-sm",
            accentMap[accent],
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
        <p className="text-right text-3xl font-black leading-none">
          {value}
          {suffix ? (
            <span className="ml-1 text-lg font-black">{suffix}</span>
          ) : null}
        </p>
      </div>
      <p className="text-sm font-semibold leading-5 text-zinc-600">{label}</p>
    </div>
  );
}