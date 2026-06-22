import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

type FeatureAccent = "blue" | "yellow" | "green" | "pink" | "dark";

type FeatureCardProps = {
  title: string;
  description: string;
  accent: FeatureAccent;
  label: string;
  className?: string;
};

const accentClasses: Record<FeatureAccent, string> = {
  blue: "bg-accent-blue",
  yellow: "bg-accent-yellow",
  green: "bg-accent-green",
  pink: "bg-accent-pink",
  dark: "bg-card-dark text-paper-base",
};

const badgeVariants: Record<FeatureAccent, "blue" | "yellow" | "green" | "pink" | "dark"> = {
  blue: "blue",
  yellow: "yellow",
  green: "green",
  pink: "pink",
  dark: "dark",
};

export function FeatureCard({
  title,
  description,
  accent,
  label,
  className,
}: FeatureCardProps) {
  return (
    <Card className={cn("liftable", accentClasses[accent], className)}>
      <CardHeader>
        <Badge variant={badgeVariants[accent]}>{label}</Badge>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-medium leading-7">{description}</p>
      </CardContent>
    </Card>
  );
}
