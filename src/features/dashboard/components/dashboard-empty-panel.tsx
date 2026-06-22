import { cn } from "@/lib/utils/cn";

type DashboardEmptyPanelProps = {
  emoji?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
};

/**
 * DashboardEmptyPanel — first-user empty state for dashboard pages.
 * Friendly card with emoji chip + CTA. No real action.
 */
export function DashboardEmptyPanel({
  emoji = "+",
  title,
  description,
  action,
  className,
}: DashboardEmptyPanelProps) {
  return (
    <section
      className={cn(
        "brutal-card flex flex-col items-start gap-4 p-6 sm:p-8",
        className,
      )}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-md border-2 border-black bg-accent-yellow text-xl font-black shadow-brutal-sm"
        aria-hidden="true"
      >
        {emoji}
      </div>
      <div className="grid gap-2">
        <h3 className="text-2xl font-black">{title}</h3>
        <p className="max-w-md font-medium leading-7 text-zinc-600">
          {description}
        </p>
      </div>
      {action ? <div>{action}</div> : null}
    </section>
  );
}
