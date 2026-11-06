import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/platform/context", destination: "/platform/knowledge", permanent: false },
      { source: "/platform/settings", destination: "/settings/fortcases/investigations", permanent: false },
      { source: "/design-preview", destination: "/platform/overview", permanent: false },
      { source: "/design-preview/cases/lsass-memory-access", destination: "/platform/cases/13845102-e81a-479e-87db-2cdb8ff21c1c", permanent: false },
      { source: "/design-preview/cases/:caseId", destination: "/platform/cases/:caseId", permanent: false },
      { source: "/design-preview/cases", destination: "/platform/cases", permanent: false },
      { source: "/design-preview/integrations/:integrationId", destination: "/platform/integrations/:integrationId", permanent: false },
      { source: "/design-preview/integrations", destination: "/platform/integrations", permanent: false },
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  webpack(config) {
    // Use the same installed Tailwind loader in both supported build pipelines.
    // Extend Next's own chain so its CSS extraction and module handling stay enabled.
    const extendCss = (rules: typeof config.module.rules) => {
      for (const rule of rules) {
        if (!rule || typeof rule !== "object") continue;
        if (Array.isArray(rule.oneOf)) extendCss(rule.oneOf);
        if (Array.isArray(rule.rules)) extendCss(rule.rules);
        if (Array.isArray(rule.use) && rule.use.some((entry: { loader?: string }) => entry?.loader?.includes("postcss-loader"))) {
          rule.use.push({ loader: "@tailwindcss/turbopack" });
        }
      }
    };
    extendCss(config.module.rules);
    return config;
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
