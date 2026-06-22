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
    <div className={cn("grid gap-4", className)}>
      <div className="flex flex-wrap gap-2" role="tablist">
        {items.map((item) => (
          <button
            aria-selected={item.id === activeId}
            className={cn(
              "rounded-md border-2 border-black px-4 py-2 font-black shadow-brutal-sm",
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
        className="brutal-border rounded-lg bg-paper-base p-4"
        role="tabpanel"
      >
        {activeItem.content}
      </div>
    </div>
  );
}
