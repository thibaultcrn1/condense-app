"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AuthCard, Field } from "@/components/auth/auth-card";
import { authErrorMessage } from "@/components/auth/auth-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/client";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm() {
  const { t, href } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  // Better Auth redirects here with ?token=… or ?error=INVALID_TOKEN.
  const token = params.get("token");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setIsLoading(true);
    const { error } = await authClient.resetPassword({
      token,
      newPassword: String(new FormData(event.currentTarget).get("password")),
    });
    setIsLoading(false);
    if (error) {
      toast.error(authErrorMessage(t, error));
      return;
    }
    toast.success(t.auth.reset.done);
    router.push(href("/sign-in"));
  }

  return (
    <AuthCard title={t.auth.reset.title} description={t.auth.reset.description}>
      {!token || params.get("error") ? (
        <div className="flex flex-col gap-4 text-sm">
          <p role="alert">{t.auth.reset.invalidLink}</p>
          <Button variant="outline" nativeButton={false} render={<Link href={href("/forgot-password")} />}>
            {t.auth.forgot.submit}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <Label htmlFor="password">{t.auth.newPassword}</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
            <p className="text-muted-foreground text-xs">{t.auth.passwordHint}</p>
          </Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t.common.loading : t.auth.reset.submit}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
