import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      new URL("https://img.clerk.com/*"),
      new URL("https://deifkwefumgah.cloudfront.net/*"),
    ],
  },
};

export default nextConfig;
