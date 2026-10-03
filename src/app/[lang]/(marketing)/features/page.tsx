import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Section, SectionHeading } from "@/components/marketing/section";
import { Button } from "@/components/ui/button";
import { localizedPath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = await getDictionary(locale);
  return pageMetadata(locale, "/features", meta.pages.features);
}

export default async function FeaturesPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const page = dict.featuresPage;

  return (
    <Section>
      <SectionHeading as="h1" eyebrow={page.eyebrow} title={page.title} text={page.subtitle} />
      <div className="mt-16 flex flex-col gap-6">
        {page.sections.map((section, i) => (
          <article key={section.title} className="grid gap-6 rounded-2xl border p-6 sm:p-8 md:grid-cols-[1fr_1fr]">
            <div>
              <span className="text-primary text-sm font-semibold tabular-nums">0{i + 1}</span>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{section.title}</h2>
              <p className="text-muted-foreground mt-3">{section.text}</p>
            </div>
            <ul className="flex flex-col justify-center gap-3">
              {section.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <Check className="text-primary mt-0.5 size-5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="mt-14 text-center">
        <Button size="lg" className="h-11 px-5 text-base" nativeButton={false} render={<Link href={localizedPath(locale, "/sign-up")} />}>
          {dict.nav.getStarted} <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </Section>
  );
}
