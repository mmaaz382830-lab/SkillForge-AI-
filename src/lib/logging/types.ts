import type { AiFeatureType } from "@/lib/ai/usage";

export type LogStatus = "success" | "blocked" | "error";

export type ErrorLogSeverity = "info" | "warning" | "error";

export type LogFeatureType = AiFeatureType | "admin" | "auth" | "materials";

export type SafeLogValue =
  | string
  | number
  | boolean
  | null
  | SafeLogValue[]
  | { [key: string]: SafeLogValue };

export type SafeLogMetadata = Record<string, SafeLogValue>;

export type LogResult =
  | {
      ok: true;
    }
  | {
      ok: false;
    };

