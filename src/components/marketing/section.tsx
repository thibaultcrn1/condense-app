import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28", className)}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  as: Heading = "h2",
  className,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      {eyebrow && <p className="text-primary text-sm font-semibold tracking-wide uppercase">{eyebrow}</p>}
      <Heading className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</Heading>
      {text && <p className="text-muted-foreground mt-4 text-lg text-pretty">{text}</p>}
    </div>
  );
}
