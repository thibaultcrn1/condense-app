import Link from "next/link";

import { LanguageSwitcher } from "@/components/site/language-switcher";
import { Logo } from "@/components/site/logo";
import { MobileNav } from "@/components/site/mobile-nav";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Button } from "@/components/ui/button";
import { type Locale, localizedPath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { site } from "@/lib/site";

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const href = (path: string) => localizedPath(locale, path);
  const links = [
    { href: href("/features"), label: dict.nav.features },
    { href: href("/pricing"), label: dict.nav.pricing },
    { href: href("/about"), label: dict.nav.about },
    { href: href("/contact"), label: dict.nav.contact },
  ];

  return (
    <header className="bg-background/75 supports-backdrop-filter:bg-background/60 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={href("/")} aria-label={site.name}>
          <Logo name={site.name} />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Button key={link.href} variant="ghost" nativeButton={false} render={<Link href={link.href} />}>
              {link.label}
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button variant="ghost" className="hidden sm:inline-flex" nativeButton={false} render={<Link href={href("/sign-in")} />}>
            {dict.nav.signIn}
          </Button>
          <Button className="hidden sm:inline-flex" nativeButton={false} render={<Link href={href("/sign-up")} />}>
            {dict.nav.getStarted}
          </Button>
          <MobileNav
            label={dict.nav.openMenu}
            links={[
              ...links,
              { href: href("/sign-in"), label: dict.nav.signIn },
              { href: href("/sign-up"), label: dict.nav.getStarted },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
