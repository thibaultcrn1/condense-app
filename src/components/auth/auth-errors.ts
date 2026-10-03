import type { Dictionary } from "@/i18n/dictionaries/fr";

/** Translates a Better Auth error by its code, falling back to its message. */
export function authErrorMessage(
  t: Dictionary["app"],
  error: { code?: string; message?: string } | null | undefined,
) {
  return (error?.code && t.auth.errors[error.code]) || error?.message || t.common.genericError;
}
