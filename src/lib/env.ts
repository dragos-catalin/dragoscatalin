import { z } from "zod";
import { clientEnv as rawClientEnv } from "./env.client";

/**
 * Server-side env, all optional: integrations must no-op cleanly when absent.
 * Client components must import `@/lib/env.client` instead (no zod in the browser).
 */
const serverSchema = z.object({
    GITHUB_TOKEN: z.string().min(1).optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
    CONTACT_TO_EMAIL: z.email().optional(),
    CONTACT_FROM_EMAIL: z.email().optional(),
    TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
    SENTRY_DSN: z.string().url().optional(),
});

const clientSchema = z.object({
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
});

export const serverEnv = serverSchema.parse({
    GITHUB_TOKEN: process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    SENTRY_DSN: process.env.SENTRY_DSN,
});

export const clientEnv = clientSchema.parse(rawClientEnv);
