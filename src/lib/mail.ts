import "server-only";

import nodemailer from "nodemailer";

import { site } from "@/lib/site";

// SMTP_URL, e.g. smtps://user:pass@smtp.example.com:465. Without it (local
// development), emails are printed to the server console instead.
const transport = process.env.SMTP_URL ? nodemailer.createTransport(process.env.SMTP_URL) : null;

export async function sendMail({ to, subject, text }: { to: string; subject: string; text: string }) {
  if (!transport) {
    console.info(`\n[mail] to=${to}\n[mail] subject=${subject}\n${text}\n`);
    return;
  }
  await transport.sendMail({ from: process.env.MAIL_FROM ?? `${site.name} <${site.contactEmail}>`, to, subject, text });
}
