"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AuthCard, Field } from "@/components/auth/auth-card";
import { authErrorMessage } from "@/components/auth/auth-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/client";
import { authClient } from "@/lib/auth-client";

export function SignUpForm() {
  const { t, href } = useI18n();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsLoading(true);
    const { error } = await authClient.signUp.email({
      name: String(form.get("name")),
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) {
      setIsLoading(false);
      toast.error(authErrorMessage(t, error));
      return;
    }
    router.push(href("/dashboard"));
    router.refresh();
  }

  // "{terms}" and "{privacy}" in the sentence become links.
  const [beforeTerms, afterTerms] = t.auth.signUp.terms.split("{terms}");
  const [between, afterPrivacy] = afterTerms.split("{privacy}");
  const linkClass = "text-foreground underline underline-offset-4";

  return (
    <AuthCard
      title={t.auth.signUp.title}
      description={t.auth.signUp.description}
      footer={
        <span>
          {t.auth.signUp.hasAccount}{" "}
          <Link href={href("/sign-in")} className="text-foreground font-medium underline-offset-4 hover:underline">
            {t.auth.signUp.signInLink}
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field>
          <Label htmlFor="name">{t.auth.name}</Label>
          <Input id="name" name="name" autoComplete="nickname" placeholder={t.auth.namePlaceholder} required />
        </Field>
        <Field>
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder={t.auth.emailPlaceholder} required />
        </Field>
        <Field>
          <Label htmlFor="password">{t.auth.password}</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          <p className="text-muted-foreground text-xs">{t.auth.passwordHint}</p>
        </Field>
        <Button type="submit" className="mt-2" disabled={isLoading}>
          {isLoading ? t.common.loading : t.auth.signUp.submit}
        </Button>
        <p className="text-muted-foreground text-xs">
          {beforeTerms}
          <Link href={href("/legal/terms")} className={linkClass}>
            {t.auth.signUp.termsLink}
          </Link>
          {between}
          <Link href={href("/legal/privacy")} className={linkClass}>
            {t.auth.signUp.privacyLink}
          </Link>
          {afterPrivacy}
        </p>
      </form>
    </AuthCard>
  );
}
