"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";

import { authErrorMessage } from "@/components/auth/auth-errors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/i18n/client";
import { LOCALE_COOKIE, type Locale, localeNames, locales } from "@/i18n/config";
import { authClient } from "@/lib/auth-client";

export function SettingsForms({ name }: { name: string }) {
  const { t, locale, href } = useI18n();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [busy, setBusy] = useState<string | null>(null);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("profile");
    const { error } = await authClient.updateUser({ name: String(new FormData(event.currentTarget).get("name")) });
    setBusy(null);
    if (error) return toast.error(authErrorMessage(t, error));
    toast.success(t.common.saved);
    router.refresh();
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy("password");
    const { error } = await authClient.changePassword({
      currentPassword: String(data.get("currentPassword")),
      newPassword: String(data.get("newPassword")),
      revokeOtherSessions: true,
    });
    setBusy(null);
    if (error) return toast.error(authErrorMessage(t, error));
    form.reset();
    toast.success(t.settings.passwordChanged);
  }

  async function deleteAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("delete");
    const { error } = await authClient.deleteUser({
      password: String(new FormData(event.currentTarget).get("password")),
    });
    setBusy(null);
    if (error) return toast.error(authErrorMessage(t, error));
    toast.success(t.settings.deleted);
    router.push(href("/"));
    router.refresh();
  }

  function changeLocale(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.push(`/${next}/dashboard/settings`);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t.settings.title}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.profile}</CardTitle>
          <CardDescription>{t.settings.profileText}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="name">{t.auth.name}</Label>
              <Input id="name" name="name" defaultValue={name} required maxLength={60} />
            </div>
            <Button type="submit" disabled={busy === "profile"}>
              {t.common.save}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.password}</CardTitle>
          <CardDescription>{t.settings.passwordText}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="currentPassword">{t.settings.currentPassword}</Label>
              <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="newPassword">{t.auth.newPassword}</Label>
              <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={8} required />
              <p className="text-muted-foreground text-xs">{t.auth.passwordHint}</p>
            </div>
            <div>
              <Button type="submit" disabled={busy === "password"}>
                {t.settings.changePassword}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.preferences}</CardTitle>
          <CardDescription>{t.settings.preferencesText}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>{t.language.label}</Label>
            <Tabs value={locale} onValueChange={(v) => changeLocale(v as Locale)}>
              <TabsList>
                {locales.map((l) => (
                  <TabsTrigger key={l} value={l}>
                    {localeNames[l]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t.theme.label}</Label>
            <Tabs value={theme ?? "system"} onValueChange={(v) => setTheme(v as string)}>
              <TabsList>
                <TabsTrigger value="light">{t.theme.light}</TabsTrigger>
                <TabsTrigger value="dark">{t.theme.dark}</TabsTrigger>
                <TabsTrigger value="system">{t.theme.system}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">{t.settings.danger}</CardTitle>
          <CardDescription>{t.settings.dangerText}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={deleteAccount} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="deletePassword">{t.settings.confirmDelete}</Label>
              <Input id="deletePassword" name="password" type="password" autoComplete="current-password" required />
            </div>
            <Button type="submit" variant="destructive" disabled={busy === "delete"}>
              {t.settings.deleteAccount}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
