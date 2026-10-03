import { format } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";

type Messages = Dictionary["app"];

/** Translates an error code from the API or the worker. Projects processed
 * before codes existed hold a ready-made sentence, shown as is. */
export function errorMessage(t: Messages, code: string | null | undefined, params: Record<string, string | number> = {}) {
  if (!code) return t.common.genericError;
  const template = t.errors[code];
  return template ? format(template, params) : code;
}

export function stageLabel(t: Messages, stage: string | null | undefined) {
  if (!stage) return t.stages.waiting;
  return t.stages[stage] ?? stage;
}

/** Reads `{ error }` from a failed API response and translates it. */
export async function responseError(t: Messages, res: Response) {
  const data = await res.json().catch(() => ({}));
  return errorMessage(t, data.error);
}
