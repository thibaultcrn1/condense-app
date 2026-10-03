import "./globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";

import { site } from "@/lib/site";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = { title: `404 · ${site.name}` };

// URLs outside any locale end up here (the proxy redirects most of them to a
// locale first). Bilingual, since the visitor's language isn't known.
export default function GlobalNotFound() {
  return (
    <html lang="fr" className={geist.className}>
      <body className="flex min-h-svh flex-col items-center justify-center gap-4 bg-white px-4 text-center text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <p className="text-6xl font-semibold text-violet-600">404</p>
        <h1 className="text-2xl font-semibold">Page introuvable · Page not found</h1>
        <Link href="/" className="text-violet-600 underline underline-offset-4">
          {site.name}
        </Link>
      </body>
    </html>
  );
}
