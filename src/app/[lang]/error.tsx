"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">{t.common.genericError}</h1>
      <Button onClick={reset}>{t.common.retry}</Button>
    </main>
  );
}
