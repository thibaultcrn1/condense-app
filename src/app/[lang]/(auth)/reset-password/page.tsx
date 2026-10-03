import type { Metadata } from "next";
import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getDictionary, getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = await getDictionary(locale);
  return pageMetadata(locale, "/reset-password", { ...meta.pages.resetPassword, noIndex: true });
}

export default function ResetPasswordPage() {
  // The form reads ?token= from the URL, which is only known at request time.
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
