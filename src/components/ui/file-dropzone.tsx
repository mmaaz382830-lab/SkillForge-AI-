import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type FileDropzoneProps = {
  title?: string;
  description?: string;
  acceptedTypes?: string[];
  maxSizeLabel?: string;
  className?: string;
};

export function FileDropzone({
  title = "Drop your learning material here",
  description = "Visual upload shell only. Upload behavior will be added in a later phase.",
  acceptedTypes = ["PDF", "TXT", "Pasted Text"],
  maxSizeLabel = "MVP limit set later",
  className,
}: FileDropzoneProps) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 border-dashed border-black bg-paper-base p-4 sm:p-6 shadow-brutal",
        className,
      )}
    >
      <div className="grid gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-md border-2 border-black bg-accent-blue text-xl font-black shadow-brutal-sm">
          UP
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-black">{title}</h3>
          <p className="mt-2 text-base font-medium leading-7">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {acceptedTypes.map((type) => (
            <Badge key={type} variant="blue">
              {type}
            </Badge>
          ))}
          <Badge variant="neutral">{maxSizeLabel}</Badge>
        </div>
        <Button variant="secondary">Browse files</Button>
      </div>
    </div>
  );
}
