import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Faq, faqJsonLd } from "@/components/marketing/faq";
import { Section, SectionHeading } from "@/components/marketing/section";
import { JsonLd } from "@/components/site/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { localizedPath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = await getDictionary(locale);
  return pageMetadata(locale, "/pricing", meta.pages.pricing);
}

export default async function PricingPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const { pricing } = dict;
  const plans = [
    { ...pricing.free, badge: null, highlighted: true, href: localizedPath(locale, "/sign-up"), disabled: false },
    { ...pricing.pro, period: null, highlighted: false, href: localizedPath(locale, "/contact"), disabled: false },
  ];

  return (
    <>
      <JsonLd data={faqJsonLd(pricing.faq)} />
      <Section>
        <SectionHeading as="h1" eyebrow={pricing.eyebrow} title={pricing.title} text={pricing.subtitle} />
        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "flex flex-col rounded-2xl border p-8",
                plan.highlighted && "border-primary shadow-primary/10 shadow-xl ring-1 ring-primary",
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{plan.name}</h2>
                {plan.badge && <Badge variant="secondary">{plan.badge}</Badge>}
              </div>
              <p className="text-muted-foreground mt-2 text-sm">{plan.description}</p>
              <p className="mt-6">
                <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground ml-2 text-sm">{plan.period}</span>}
              </p>
              <ul className="mt-8 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm">
                    <Check className="text-primary size-5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 h-11 text-base"
                variant={plan.highlighted ? "default" : "outline"}
                nativeButton={false}
                render={<Link href={plan.href} />}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </Section>
      <Section className="pt-0 sm:pt-0">
        <SectionHeading title={pricing.faqTitle} className="mb-10" />
        <Faq items={pricing.faq} />
      </Section>
    </>
  );
}
