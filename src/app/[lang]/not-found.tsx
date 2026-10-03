import Link from "next/link";

import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { localizedPath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { site } from "@/lib/site";

export default async function NotFound() {
  const locale = await getLocale();
  const { notFound } = await getDictionary(locale);
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo name={site.name} />
      <p className="text-primary text-6xl font-semibold tracking-tight">404</p>
      <div>
        <h1 className="text-2xl font-semibold">{notFound.title}</h1>
        <p className="text-muted-foreground mt-2">{notFound.text}</p>
      </div>
      <Button nativeButton={false} render={<Link href={localizedPath(locale, "/")} />}>
        {notFound.home}
      </Button>
    </main>
  );
}
