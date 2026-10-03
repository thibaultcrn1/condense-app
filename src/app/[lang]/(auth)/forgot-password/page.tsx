import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getDictionary, getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = await getDictionary(locale);
  return pageMetadata(locale, "/forgot-password", { ...meta.pages.forgotPassword });
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
