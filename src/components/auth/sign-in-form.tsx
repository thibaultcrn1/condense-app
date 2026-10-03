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

export function SignInForm() {
  const { t, href } = useI18n();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsLoading(true);
    const { error } = await authClient.signIn.email({
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

  return (
    <AuthCard
      title={t.auth.signIn.title}
      description={t.auth.signIn.description}
      footer={
        <span>
          {t.auth.signIn.noAccount}{" "}
          <Link href={href("/sign-up")} className="text-foreground font-medium underline-offset-4 hover:underline">
            {t.auth.signIn.signUpLink}
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field>
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder={t.auth.emailPlaceholder} required />
        </Field>
        <Field>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.auth.password}</Label>
            <Link href={href("/forgot-password")} className="text-muted-foreground text-xs underline-offset-4 hover:underline">
              {t.auth.signIn.forgot}
            </Link>
          </div>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>
        <Button type="submit" className="mt-2" disabled={isLoading}>
          {isLoading ? t.common.loading : t.auth.signIn.submit}
        </Button>
      </form>
    </AuthCard>
  );
}
