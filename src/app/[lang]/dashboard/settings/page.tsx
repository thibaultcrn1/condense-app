import type { Metadata } from "next";

import { SettingsForms } from "@/components/settings-forms";
import { getDictionary } from "@/i18n/server";
import { getSessionUser } from "@/lib/projects";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary();
  return { title: meta.pages.settings.title };
}

export default async function SettingsPage() {
  const user = (await getSessionUser())!;
  return <SettingsForms name={user.name} />;
}
