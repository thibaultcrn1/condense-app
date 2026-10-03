"use client";

import { createContext, useContext } from "react";

import { type Locale, localizedPath } from "./config";
import type { Dictionary } from "./dictionaries/fr";

type Messages = Dictionary["app"];

const I18nContext = createContext<{ locale: Locale; t: Messages } | null>(null);

// Only the app's UI strings reach the browser; marketing pages are rendered
// on the server with the full dictionary.
export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  return <I18nContext.Provider value={{ locale, t: messages }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return {
    ...context,
    /** Prefixes an app path with the current locale. */
    href: (path: string) => localizedPath(context.locale, path),
  };
}
