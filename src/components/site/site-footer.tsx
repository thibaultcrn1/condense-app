import Link from "next/link";

import { Logo } from "@/components/site/logo";
import { type Locale, localizedPath } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { site } from "@/lib/site";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const href = (path: string) => localizedPath(locale, path);
  const columns = [
    {
      title: dict.footer.product,
      links: [
        { href: href("/features"), label: dict.nav.features },
        { href: href("/pricing"), label: dict.nav.pricing },
        { href: href("/sign-up"), label: dict.nav.getStarted },
      ],
    },
    {
      title: dict.footer.company,
      links: [
        { href: href("/about"), label: dict.nav.about },
        { href: href("/contact"), label: dict.nav.contact },
      ],
    },
    {
      title: dict.footer.legal,
      links: [
        { href: href("/legal/notice"), label: dict.legal.notice.title },
        { href: href("/legal/terms"), label: dict.legal.terms.title },
        { href: href("/legal/privacy"), label: dict.legal.privacy.title },
        { href: href("/legal/cookies"), label: dict.legal.cookies.title },
      ],
    },
  ];

  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-3">
          <Logo name={site.name} />
          <p className="text-muted-foreground max-w-xs text-sm">{dict.footer.tagline}</p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-semibold">{column.title}</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="text-muted-foreground mx-auto max-w-6xl border-t px-4 py-6 text-sm sm:px-6">
        © {new Date().getFullYear()} {site.name}. {dict.footer.rights}
      </div>
    </footer>
  );
}
