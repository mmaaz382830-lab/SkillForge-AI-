"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  React.useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        aria-modal="true"
        className={cn(
          "brutal-card w-full max-w-lg bg-paper-base p-6",
          className,
        )}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black">{title}</h2>
            {description ? (
              <p className="mt-2 font-medium leading-7">{description}</p>
            ) : null}
          </div>
          <Button aria-label="Close dialog" onClick={onClose} size="icon" variant="secondary">
            X
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
