import type { MetadataRoute } from "next";

import { localizedPath, locales } from "@/i18n/config";
import { publicPaths } from "@/lib/seo";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.flatMap(({ path, priority, changeFrequency }) =>
    locales.map((locale) => ({
      url: `${site.url}${localizedPath(locale, path)}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${site.url}${localizedPath(l, path)}`])),
      },
    })),
  );
}
