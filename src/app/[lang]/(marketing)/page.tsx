import {
  ArrowRight,
  AudioLines,
  Check,
  Clapperboard,
  Download,
  Film,
  Scissors,
  Sparkles,
  Radio,
  Upload,
  Wand2,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EditorMock } from "@/components/marketing/editor-mock";
import { Faq, faqJsonLd } from "@/components/marketing/faq";
import { Section, SectionHeading } from "@/components/marketing/section";
import { JsonLd } from "@/components/site/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { localizedPath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return {
    ...pageMetadata(locale, "/", { description: dict.meta.description }),
    // The home page uses the default "<name> — <tagline>" title.
    title: { absolute: `${site.name} — ${dict.meta.tagline}` },
  };
}

const STEP_ICONS = [Upload, Sparkles, Download];
const FEATURE_ICONS = [Sparkles, AudioLines, Scissors, Film, Radio, Clapperboard];
const USE_CASE_ICONS = [Clapperboard, Film, Wand2];

export default async function HomePage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const { hero, steps, features, editor, useCases, faq, cta } = dict.home;
  const href = (path: string) => localizedPath(locale, path);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: site.name,
              url: site.url,
              logo: `${site.url}/icon.svg`,
              email: site.contactEmail,
            },
            { "@type": "WebSite", name: site.name, url: `${site.url}${href("/")}`, inLanguage: locale },
            {
              "@type": "SoftwareApplication",
              name: site.name,
              applicationCategory: "MultimediaApplication",
              operatingSystem: "Web",
              description: dict.meta.description,
              inLanguage: locale,
              offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            },
          ],
        }}
      />
      <JsonLd data={faqJsonLd(faq.items)} />

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center blur-3xl"
        >
          <div className="aspect-[1.6] w-[60rem] bg-gradient-to-tr from-violet-500/30 via-fuchsia-500/20 to-amber-400/20 opacity-80 [clip-path:polygon(50%_0,100%_35%,80%_100%,20%_90%,0_40%)] dark:from-violet-600/25 dark:via-fuchsia-600/15" />
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 sm:px-6 sm:pt-24 lg:grid-cols-[1.05fr_1fr] lg:pb-28">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge variant="secondary" className="mb-6 h-7 gap-1.5 px-3 text-sm">
              <Sparkles className="text-primary" /> {hero.badge}
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {hero.title}{" "}
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-amber-300">
                {hero.titleHighlight}
              </span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-xl text-lg text-pretty">{hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="h-11 px-5 text-base" nativeButton={false} render={<Link href={href("/sign-up")} />}>
                {hero.ctaPrimary} <ArrowRight data-icon="inline-end" />
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-5 text-base" nativeButton={false} render={<Link href="#how-it-works" />}>
                {hero.ctaSecondary}
              </Button>
            </div>
            <p className="text-muted-foreground mt-4 text-sm">{hero.note}</p>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <EditorMock labels={dict.home.mock} />
          </div>
        </div>
      </div>

      {/* How it works */}
      <Section id="how-it-works" className="border-t">
        <SectionHeading eyebrow={steps.eyebrow} title={steps.title} />
        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.items.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <li key={step.title} className="bg-card relative rounded-2xl border p-6">
                <span className="text-muted-foreground absolute top-6 right-6 text-sm font-semibold tabular-nums">
                  0{i + 1}
                </span>
                <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground mt-2">{step.text}</p>
              </li>
            );
          })}
        </ol>
      </Section>

      {/* Features */}
      <Section className="pt-0 sm:pt-0">
        <SectionHeading eyebrow={features.eyebrow} title={features.title} />
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.items.map((feature, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div key={feature.title} className="bg-background p-7">
                <Icon className="text-primary size-6" />
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Editor */}
      <div className="bg-muted/40 border-y">
        <Section className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-primary text-sm font-semibold tracking-wide uppercase">{editor.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{editor.title}</h2>
            <p className="text-muted-foreground mt-4 text-lg text-pretty">{editor.text}</p>
            <ul className="mt-8 flex flex-col gap-3">
              {editor.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <Check className="text-primary mt-0.5 size-5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <EditorMock labels={dict.home.mock} />
        </Section>
      </div>

      {/* Use cases */}
      <Section>
        <SectionHeading eyebrow={useCases.eyebrow} title={useCases.title} />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {useCases.items.map((item, i) => {
            const Icon = USE_CASE_ICONS[i];
            return (
              <div key={item.title} className="rounded-2xl border p-6">
                <Icon className="text-primary size-6" />
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-2">{item.text}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="pt-0 sm:pt-0">
        <SectionHeading title={faq.title} className="mb-10" />
        <Faq items={faq.items} />
      </Section>

      {/* Final CTA */}
      <Section className="pt-0 sm:pt-0">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-amber-500 px-6 py-16 text-center text-white sm:px-16">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
          <h2 className="relative text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{cta.title}</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/85">{cta.text}</p>
          <Button
            size="lg"
            variant="secondary"
            className="relative mt-8 h-11 px-6 text-base"
            nativeButton={false}
            render={<Link href={href("/sign-up")} />}
          >
            {cta.button} <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </Section>
    </>
  );
}
