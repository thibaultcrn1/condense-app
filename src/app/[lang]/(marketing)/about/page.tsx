import type { Metadata } from "next";

import { Section, SectionHeading } from "@/components/marketing/section";
import { getDictionary, getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = await getDictionary(locale);
  return pageMetadata(locale, "/about", meta.pages.about);
}

export default async function AboutPage() {
  const { about } = await getDictionary();
  return (
    <Section>
      <SectionHeading as="h1" eyebrow={about.eyebrow} title={about.title} />
      <div className="mx-auto mt-12 flex max-w-2xl flex-col gap-6 text-lg leading-relaxed">
        {about.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </Section>
  );
}
