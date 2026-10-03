import type { MetadataRoute } from "next";

import { locales } from "@/i18n/config";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The app and the API are private.
      disallow: ["/api/", ...locales.map((l) => `/${l}/dashboard`), ...locales.map((l) => `/${l}/reset-password`)],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
