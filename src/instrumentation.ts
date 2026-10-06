import type { Instrumentation } from "next";

// Server-only error capture. No client SDK: it would add first-load JS and need
// a consent category. Without SENTRY_DSN nothing is imported at all.
export async function register() {
    const dsn = process.env.SENTRY_DSN;
    if (!dsn) return;
    if (process.env.NEXT_RUNTIME !== "nodejs" && process.env.NEXT_RUNTIME !== "edge") return;
    const [Sentry, { sentryServerOptions }] = await Promise.all([
        import("@sentry/nextjs"),
        import("@/lib/sentry"),
    ]);
    Sentry.init(sentryServerOptions(dsn));
}

export const onRequestError: Instrumentation.onRequestError = async (...args) => {
    if (!process.env.SENTRY_DSN) return;
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureRequestError(...args);
};
