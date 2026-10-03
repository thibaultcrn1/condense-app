import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountMenu } from "@/components/site/account-menu";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { localizedPath } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { getSessionUser } from "@/lib/projects";
import { site } from "@/lib/site";

// Private area: never indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: LayoutProps<"/[lang]/dashboard">) {
  const locale = await getLocale();
  const user = await getSessionUser();
  if (!user) redirect(localizedPath(locale, "/sign-in"));

  return (
    <div className="flex min-h-svh w-full flex-col">
      <header className="bg-background/80 sticky top-0 z-30 border-b backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href={localizedPath(locale, "/dashboard")} aria-label={site.name}>
            <Logo name={site.name} />
          </Link>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
            <AccountMenu name={user.name} email={user.email} />
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6">{children}</main>
    </div>
  );
}
