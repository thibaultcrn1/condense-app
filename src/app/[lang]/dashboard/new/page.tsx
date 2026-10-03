import type { Metadata } from "next";

import { NewProjectForm } from "@/components/new-project-form";
import { getDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary();
  return { title: meta.pages.newProject.title };
}

export default function NewProjectPage() {
  return (
    <div className="flex justify-center">
      <NewProjectForm />
    </div>
  );
}
