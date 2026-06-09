import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      "/api/test-cases/run": ["./node_modules/playwright-core/browsers.json"],
    },
  },
};

export default nextConfig;