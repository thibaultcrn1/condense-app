import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "bullmq", "ioredis"],
  experimental: {
    // 404 for URLs outside the [lang] root layout (see app/global-not-found.tsx).
    globalNotFound: true,
  },
};

export default nextConfig;
