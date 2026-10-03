import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section } from "@/components/marketing/section";
import { format } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

const DOCS = ["notice", "terms", "privacy", "cookies"] as const;
type Doc = (typeof DOCS)[number];
// Bump when a legal text changes.
const LAST_UPDATED = new Date("2026-10-01");

function isDoc(value: string): value is Doc {
  return DOCS.includes(value as Doc);
}

export function generateStaticParams() {
  return DOCS.map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/legal/[doc]">): Promise<Metadata> {
  const { doc } = await params;
  if (!isDoc(doc)) notFound();
  const locale = await getLocale();
  const { meta } = await getDictionary(locale);
  return pageMetadata(locale, `/legal/${doc}`, meta.pages[doc]);
}

export default async function LegalPage({ params }: PageProps<"/[lang]/legal/[doc]">) {
  const { doc } = await params;
  if (!isDoc(doc)) notFound();
  const locale = await getLocale();
  const { legal } = await getDictionary(locale);
  const content = legal[doc];
  const values = {
    site: site.name,
    email: site.contactEmail,
    ...site.legal,
  };

  return (
    <Section className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{content.title}</h1>
      <p className="text-muted-foreground mt-3 text-sm">
        {format(legal.updated, {
          date: LAST_UPDATED.toLocaleDateString(locale, { dateStyle: "long" }),
        })}
      </p>
      <div className="mt-10 flex flex-col gap-8">
        {content.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold">{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="text-muted-foreground mt-3 leading-relaxed">
                {format(paragraph, values)}
              </p>
            ))}
          </section>
        ))}
      </div>
    </Section>
  );
}
