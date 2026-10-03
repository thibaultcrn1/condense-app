import type { Metadata } from "next";

import { defaultLocale, type Locale, localizedPath, locales, ogLocales } from "@/i18n/config";
import { site } from "@/lib/site";

/** Canonical URL, hreflang alternates and Open Graph basics for a page that
 * exists in every locale at the same path. */
export function pageMetadata(
  locale: Locale,
  path: string,
  { title, description, noIndex }: { title?: string; description?: string; noIndex?: boolean },
): Metadata {
  const languages = Object.fromEntries(locales.map((l) => [l, localizedPath(l, path)]));
  // A page-level openGraph object replaces the inherited one, image included,
  // so the locale's generated image (app/[lang]/opengraph-image) is set here.
  const image = { url: `/${locale}/opengraph-image`, width: 1200, height: 630, alt: site.name };
  return {
    title,
    description,
    alternates: {
      canonical: localizedPath(locale, path),
      languages: { ...languages, "x-default": localizedPath(defaultLocale, path) },
    },
    openGraph: {
      title: title ? `${title} · ${site.name}` : site.name,
      description,
      url: localizedPath(locale, path),
      siteName: site.name,
      locale: ogLocales[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocales[l]),
      type: "website",
      images: [image],
    },
    twitter: { card: "summary_large_image", title: title ?? site.name, description, images: [image] },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

/** Pages that exist publicly in every locale, for the sitemap. */
export const publicPaths = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/features", priority: 0.8, changeFrequency: "monthly" },
  { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/legal/notice", priority: 0.2, changeFrequency: "yearly" },
  { path: "/legal/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/legal/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/legal/cookies", priority: 0.2, changeFrequency: "yearly" },
] as const;
