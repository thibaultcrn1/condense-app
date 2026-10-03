// Brand and site-wide settings. Legal details are placeholders to fill in
// before going live (they appear in the legal notice and privacy policy).
export const site = {
  name: "Condensé",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@example.com",
  legal: {
    company: process.env.NEXT_PUBLIC_LEGAL_COMPANY ?? "[Raison sociale]",
    address: process.env.NEXT_PUBLIC_LEGAL_ADDRESS ?? "[Adresse du siège]",
    registration: process.env.NEXT_PUBLIC_LEGAL_REGISTRATION ?? "[RCS / SIREN]",
    director: process.env.NEXT_PUBLIC_LEGAL_DIRECTOR ?? "[Directeur de la publication]",
    host: process.env.NEXT_PUBLIC_LEGAL_HOST ?? "[Hébergeur, adresse et téléphone]",
  },
};
