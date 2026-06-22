import { AppLogo } from "@/components/layout/app-logo";

type AuthHeaderProps = {
  title: string;
  subtitle: string;
};

/**
 * AuthHeader — logo + editorial heading + supportive subtitle.
 * Sits at the top of every auth card.
 * Server component — no client logic.
 */
export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="mb-8 grid gap-3">
      <AppLogo className="mb-2" />
      <h1 className="font-heading text-3xl font-black leading-tight text-ink-text sm:text-4xl">
        {title}
      </h1>
      <p className="max-w-sm text-base font-medium text-zinc-600">{subtitle}</p>
    </div>
  );
}
