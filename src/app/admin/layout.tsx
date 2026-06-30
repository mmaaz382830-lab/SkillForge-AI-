import type { Metadata } from "next";
import { requireAdminProfile } from "@/lib/admin/access";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Admin — ${siteConfig.name}`,
  description: "Protected SkillForge AI admin panel.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce admin profile check on server-side for all admin paths
  await requireAdminProfile();

  return <>{children}</>;
}
