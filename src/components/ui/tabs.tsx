"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type TabItem = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type TabsProps = {
  items: TabItem[];
  defaultValue?: string;
  className?: string;
};

export function Tabs({ items, defaultValue, className }: TabsProps) {
  const firstId = items[0]?.id;
  const [activeId, setActiveId] = React.useState(defaultValue ?? firstId);
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  if (!activeItem) {
    return null;
  }

  return (
    <div className={cn("grid min-w-0 max-w-full gap-4", className)}>
      <div className="flex min-w-0 gap-2 overflow-x-auto" role="tablist">
        {items.map((item) => (
          <button
            aria-selected={item.id === activeId}
            className={cn(
              "min-w-0 shrink-0 whitespace-normal rounded-md border-2 border-black px-3 py-2.5 min-h-11 font-black shadow-brutal-sm",
              item.id === activeId ? "bg-accent-yellow" : "bg-paper-base",
            )}
            key={item.id}
            onClick={() => setActiveId(item.id)}
            role="tab"
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        className="brutal-border min-w-0 overflow-hidden rounded-lg bg-paper-base p-3 sm:p-4"
        role="tabpanel"
      >
        {activeItem.content}
      </div>
    </div>
  );
}
