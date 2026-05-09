import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-c32a1795-416a-447c-b709-cbd277a6ade1.space-z.ai",
  ],
};

export default nextConfig;
