export const publicRoutes = {
  home: "/",
  features: "/features",
  pricing: "/pricing",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  authCallback: "/auth/callback",
} as const;

export const dashboardRoutes = {
  dashboard: "/dashboard",
  materials: "/dashboard/materials",
  materialDetail: (id: string) => `/dashboard/materials/${id}`,
  roadmaps: "/dashboard/roadmaps",
  flashcards: "/dashboard/flashcards",
  quizzes: "/dashboard/quizzes",
  interview: "/dashboard/interview",
  progress: "/dashboard/progress",
  profile: "/dashboard/profile",
  settings: "/dashboard/settings",
} as const;

export const adminRoutes = {
  admin: "/admin",
  users: "/admin/users",
  logs: "/admin/logs",
} as const;

export const appRoutes = {
  public: publicRoutes,
  dashboard: dashboardRoutes,
  admin: adminRoutes,
} as const;
