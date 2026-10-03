import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getDictionary, getLocale } from "@/i18n/server";

export default async function MarketingLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return (
    <>
      <a
        href="#content"
        className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-3 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {dict.nav.skipToContent}
      </a>
      <SiteHeader locale={locale} dict={dict} />
      <main id="content" className="flex-1">
        {children}
      </main>
      <SiteFooter locale={locale} dict={dict} />
    </>
  );
}
