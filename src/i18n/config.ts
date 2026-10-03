export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

// Remembers an explicit language choice across visits (set by the switcher).
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const localeNames: Record<Locale, string> = { fr: "Français", en: "English" };
export const ogLocales: Record<Locale, string> = { fr: "fr_FR", en: "en_US" };

export function hasLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

/** "/pricing" in French -> "/fr/pricing"; "/" -> "/fr". */
export function localizedPath(locale: Locale, path: string) {
  return `/${locale}${path === "/" ? "" : path}`;
}

/** Picks the best supported locale from an Accept-Language header. */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  const ranked = (acceptLanguage ?? "")
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return ranked.find((r) => hasLocale(r.lang))?.lang as Locale ?? defaultLocale;
}

/** Replaces {name} placeholders: format("Hi {name}", { name: "Ana" }). */
export function format(template: string, params: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}
