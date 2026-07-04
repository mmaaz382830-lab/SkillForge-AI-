export type ProfileRole = "user" | "admin" | "blocked";

export type ProfilePlan = "free" | "pro" | "demo_admin";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: ProfileRole;
  plan: ProfilePlan;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
  default_quiz_difficulty?: "beginner" | "intermediate" | "advanced" | null;
  default_roadmap_difficulty?: "beginner" | "intermediate" | "advanced" | null;
};

export type AuthActionResult = {
  success: boolean;
  message: string;
  redirectTo?: string;
};
