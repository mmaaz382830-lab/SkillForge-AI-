import { adminRoutes, dashboardRoutes, publicRoutes } from "@/config/routes";

export const publicNavigation = [
  { label: "Features", href: publicRoutes.features },
  { label: "Login", href: publicRoutes.login },
] as const;

export const dashboardNavigation = [
  { label: "Dashboard", href: dashboardRoutes.dashboard },
  { label: "Materials", href: dashboardRoutes.materials },
  { label: "Chat", href: dashboardRoutes.chat },
  { label: "Roadmaps", href: dashboardRoutes.roadmaps },
  { label: "Flashcards", href: dashboardRoutes.flashcards },
  { label: "Quizzes", href: dashboardRoutes.quizzes },
  { label: "Interview", href: dashboardRoutes.interview },
  { label: "Progress", href: dashboardRoutes.progress },
  { label: "Profile", href: dashboardRoutes.profile },
  { label: "Settings", href: dashboardRoutes.settings },
] as const;

export const adminNavigation = [
  { label: "Overview", href: adminRoutes.admin },
  { label: "Users", href: adminRoutes.users },
  { label: "Usage", href: adminRoutes.usage },
  { label: "Logs", href: adminRoutes.logs },
  { label: "Back to Dashboard", href: dashboardRoutes.dashboard },
] as const;

