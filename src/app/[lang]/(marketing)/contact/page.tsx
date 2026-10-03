import { Mail } from "lucide-react";
import type { Metadata } from "next";

import { Section, SectionHeading } from "@/components/marketing/section";
import { Button } from "@/components/ui/button";
import { getDictionary, getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = await getDictionary(locale);
  return pageMetadata(locale, "/contact", meta.pages.contact);
}

export default async function ContactPage() {
  const { contact } = await getDictionary();
  return (
    <Section>
      <SectionHeading as="h1" eyebrow={contact.eyebrow} title={contact.title} text={contact.subtitle} />
      <div className="mx-auto mt-12 flex max-w-xl flex-col items-center gap-3 rounded-2xl border p-8 text-center">
        <Mail className="text-primary size-8" />
        <p className="font-medium">{contact.emailLabel}</p>
        <Button size="lg" variant="outline" className="h-11 text-base" nativeButton={false} render={<a href={`mailto:${site.contactEmail}`} />}>
          {site.contactEmail}
        </Button>
        <p className="text-muted-foreground text-sm">{contact.responseTime}</p>
      </div>
      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
        {contact.topics.map((topic) => (
          <div key={topic.title} className="rounded-2xl border p-6">
            <h2 className="font-semibold">{topic.title}</h2>
            <p className="text-muted-foreground mt-2 text-sm">{topic.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
