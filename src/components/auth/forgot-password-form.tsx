"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthCard, Field } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/client";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const { t, href } = useI18n();
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    // Same message whether or not the account exists, so emails can't be probed.
    await authClient.requestPasswordReset({
      email: String(new FormData(event.currentTarget).get("email")),
      redirectTo: href("/reset-password"),
    });
    setState("sent");
  }

  return (
    <AuthCard
      title={t.auth.forgot.title}
      description={t.auth.forgot.description}
      footer={
        <Link href={href("/sign-in")} className="text-foreground font-medium underline-offset-4 hover:underline">
          {t.auth.forgot.back}
        </Link>
      }
    >
      {state === "sent" ? (
        <p role="status" className="text-sm">
          {t.auth.forgot.sent}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input id="email" name="email" type="email" autoComplete="email" placeholder={t.auth.emailPlaceholder} required />
          </Field>
          <Button type="submit" disabled={state === "sending"}>
            {state === "sending" ? t.common.loading : t.auth.forgot.submit}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
