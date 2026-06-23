type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

const SUPABASE_ENV_KEYS = {
  url: "NEXT_PUBLIC_SUPABASE_URL",
  anonKey: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
} as const;

function readRequiredPublicEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to .env.local using .env.example as a guide.`,
    );
  }

  return value;
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  return {
    url: readRequiredPublicEnv(SUPABASE_ENV_KEYS.url),
    anonKey: readRequiredPublicEnv(SUPABASE_ENV_KEYS.anonKey),
  };
}
