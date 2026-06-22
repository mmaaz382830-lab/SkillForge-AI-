import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type LoadingStateProps = {
  title: string;
  description?: string;
};

export function LoadingState({ title, description }: LoadingStateProps) {
  return (
    <Card aria-busy="true" aria-live="polite">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? (
          <p className="font-medium leading-7">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  );
}
