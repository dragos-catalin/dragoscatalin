import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs/config";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
    reactCompiler: true,
    cacheComponents: true,
    typedRoutes: true,
    experimental: {
        // Tailwind CSS is ~13 KB; inlining removes a render-blocking round trip
        // (Lighthouse mobile 2026-09-15: 154 ms). Portfolio = mostly first visits.
        inlineCss: true,
    },
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "avatars.githubusercontent.com" },
            { protocol: "https", hostname: "opengraph.githubassets.com" },
        ],
        formats: ["image/avif", "image/webp"],
    },
    redirects: async () => [
        { source: "/projects/muzicai", destination: "/projects/mixai", permanent: true },
        { source: "/ro/projects/muzicai", destination: "/ro/projects/mixai", permanent: true },
        // Feedbrake was announced as "Unscroll"; the Play Console privacy URL points here.
        { source: "/unscroll", destination: "/feedbrake", permanent: true },
        { source: "/unscroll/privacy", destination: "/feedbrake/privacy", permanent: true },
        { source: "/:locale(en|ro)/unscroll", destination: "/:locale/feedbrake", permanent: true },
        {
            source: "/:locale(en|ro)/unscroll/privacy",
            destination: "/:locale/feedbrake/privacy",
            permanent: true,
        },
    ],
    headers: async () => [
        {
            source: "/(.*)",
            headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "DENY" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
                {
                    key: "Strict-Transport-Security",
                    value: "max-age=63072000; includeSubDomains; preload",
                },
            ],
        },
    ],
};

const config = withBotId(withNextIntl(nextConfig));

export default process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
    ? withSentryConfig(config, {
          silent: true,
          ...(process.env.SENTRY_ORG ? { org: process.env.SENTRY_ORG } : {}),
          ...(process.env.SENTRY_PROJECT ? { project: process.env.SENTRY_PROJECT } : {}),
          widenClientFileUpload: true,
      })
    : config;
