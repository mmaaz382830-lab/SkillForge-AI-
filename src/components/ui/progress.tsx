import { cn } from "@/lib/utils/cn";

type ProgressProps = {
  value: number;
  max?: number;
  label?: string;
  description?: string;
  className?: string;
  indicatorClassName?: string;
};

export function Progress({
  value,
  max = 100,
  label,
  description,
  className,
  indicatorClassName,
}: ProgressProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  const rounded = Math.round(percentage);

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center justify-between gap-4 text-sm font-black">
        <span>{label ?? "Progress"}</span>
        <span>
          {value} / {max} · {rounded}%
        </span>
      </div>
      <div
        aria-label={label ?? "Progress"}
        aria-valuemax={max}
        aria-valuemin={0}
        aria-valuenow={value}
        className="h-5 overflow-hidden rounded-md border-2 border-black bg-paper-base"
        role="progressbar"
      >
        <div
          className={cn("h-full bg-accent-green", indicatorClassName)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {description ? (
        <p className="text-sm font-semibold leading-6">{description}</p>
      ) : null}
    </div>
  );
}
