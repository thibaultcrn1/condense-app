import type { Metadata } from "next";

import { SignInForm } from "@/components/auth/sign-in-form";
import { getDictionary, getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = await getDictionary(locale);
  return pageMetadata(locale, "/sign-in", { ...meta.pages.signIn });
}

export default function SignInPage() {
  return <SignInForm />;
}
