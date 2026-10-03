import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { sendMail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import { deletePrefix } from "@/lib/storage";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
    // We don't know the user's language here, so the email is bilingual.
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: `${site.name} — Réinitialisation du mot de passe / Password reset`,
        text: [
          `Bonjour ${user.name},`,
          "Pour choisir un nouveau mot de passe, ouvrez ce lien (valable 1 heure) :",
          url,
          "",
          `Hi ${user.name},`,
          "To choose a new password, open this link (valid for 1 hour):",
          url,
          "",
          "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail. / If you didn't ask for this, ignore this email.",
        ].join("\n"),
      });
    },
  },
  user: {
    deleteUser: {
      enabled: true,
      // Projects are removed with the user (cascade); their files live in
      // object storage and must be deleted explicitly.
      beforeDelete: async (user) => {
        const projects = await prisma.project.findMany({ where: { userId: user.id }, select: { id: true } });
        await Promise.all(projects.map((p) => deletePrefix(`projects/${p.id}/`)));
      },
    },
  },
  advanced: {
    database: {
      // Let MongoDB generate ObjectIds instead of Better Auth's default string ids.
      generateId: false,
    },
  },
});
