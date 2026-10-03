import { ImageResponse } from "next/og";

import { hasLocale, locales } from "@/i18n/config";
import en from "@/i18n/dictionaries/en";
import fr from "@/i18n/dictionaries/fr";
import { site } from "@/lib/site";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// Shared by every page of a locale (pages without their own image inherit it).
export default async function OpengraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = hasLocale(lang) && lang === "en" ? en : fr;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #1e1033 0%, #4c1d95 45%, #a21caf 80%, #f59e0b 120%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "linear-gradient(135deg, #8b5cf6, #d946ef)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 32 32">
              <path d="M11 8.5v15l5.2-3V11.5z" fill="#fff" />
              <path d="M18.2 12.7l5.8 3.3-5.8 3.3z" fill="#fff" fillOpacity=".85" />
            </svg>
          </div>
          <span style={{ fontSize: 44, fontWeight: 700 }}>{site.name}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, maxWidth: 980 }}>{dict.meta.tagline}</span>
          <span style={{ fontSize: 30, opacity: 0.85 }}>{dict.home.hero.note}</span>
        </div>
      </div>
    ),
    size,
  );
}
