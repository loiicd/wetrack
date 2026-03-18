import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  typedRoutes: true,
  turbopack: {
    resolveAlias: {
      // alasql löst standardmäßig auf alasql.fs.js auf (inkl. React Native).
      // Für Turbopack die reine JS-Version ohne Dateisystem verwenden.
      alasql: "../../node_modules/alasql/dist/alasql.js",
    },
  },
  images: {
    remotePatterns: [new URL("https://img.clerk.com/*")],
  },
};

export default nextConfig;
