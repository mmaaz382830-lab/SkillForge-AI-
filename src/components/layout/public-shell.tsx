import * as React from "react";
import { PublicFooter } from "./public-footer";
import { PublicHeader } from "./public-header";

type PublicShellProps = {
  children: React.ReactNode;
};

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="min-h-screen bg-paper-base text-ink-text">
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}
