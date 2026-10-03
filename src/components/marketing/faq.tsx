import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Answers stay in the HTML while collapsed (hiddenUntilFound), so search
// engines and in-page search can read them.
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <Accordion className="mx-auto max-w-3xl">
      {items.map((item) => (
        <AccordionItem key={item.q} value={item.q}>
          <AccordionTrigger className="text-base">{item.q}</AccordionTrigger>
          <AccordionContent hiddenUntilFound className="text-muted-foreground text-base">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
