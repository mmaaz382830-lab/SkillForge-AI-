"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export type DropdownItem = {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
};

type DropdownProps = {
  label: string;
  items: DropdownItem[];
  className?: string;
};

export function Dropdown({ label, items, className }: DropdownProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className={cn("relative inline-block", className)} ref={containerRef}>
      <Button
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        variant="secondary"
      >
        {label}
      </Button>
      {open ? (
        <div
          className="absolute left-0 right-0 sm:left-auto sm:right-0 sm:min-w-48 z-20 mt-2 rounded-lg border-2 border-black bg-paper-base p-2 shadow-brutal"
          role="menu"
        >
          {items.map((item) => (
            <button
              className="w-full rounded-md px-3 py-2.5 min-h-11 text-left font-bold hover:bg-accent-yellow disabled:opacity-60"
              disabled={item.disabled}
              key={item.label}
              onClick={() => {
                item.onSelect();
                setOpen(false);
              }}
              role="menuitem"
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
