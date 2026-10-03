import type { Metadata } from "next";

import { SignUpForm } from "@/components/auth/sign-up-form";
import { getDictionary, getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = await getDictionary(locale);
  return pageMetadata(locale, "/sign-up", { ...meta.pages.signUp });
}

export default function SignUpPage() {
  return <SignUpForm />;
}
