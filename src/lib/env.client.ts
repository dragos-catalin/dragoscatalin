/**
 * Public env for client components — NO zod here. Importing `env.ts` from a
 * "use client" file pulled the full zod bundle (91 KB gz) into the first-load
 * JS (Lighthouse mobile, 2026-09-15). NEXT_PUBLIC_* values are inlined at build
 * time, so a plain object is all that is needed; validation stays in `env.ts`.
 */
export const clientEnv = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
} as const;
