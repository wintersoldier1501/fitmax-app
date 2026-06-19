import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
});

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.100.78'],
  // @ts-ignore - Next.js 16 turbopack config
  turbopack: {}
};

export default withPWA(nextConfig);
