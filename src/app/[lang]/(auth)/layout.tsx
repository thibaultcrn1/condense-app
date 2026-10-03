import Link from "next/link";

import { LanguageSwitcher } from "@/components/site/language-switcher";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { localizedPath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { site } from "@/lib/site";

export default async function AuthLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  return (
    <div className="relative flex min-h-svh flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-b from-violet-500/10 to-transparent"
      />
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link href={localizedPath(locale, "/")} aria-label={site.name}>
          <Logo name={site.name} />
        </Link>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-8 pb-16 sm:pt-16">{children}</main>
    </div>
  );
}
