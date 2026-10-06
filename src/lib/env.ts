import { z } from "zod";
import { clientEnv as rawClientEnv } from "./env.client";

/**
 * Server-side env, all optional: integrations must no-op cleanly when absent.
 * Client components must import `@/lib/env.client` instead (no zod in the browser).
 */
const serverSchema = z.object({
    GITHUB_TOKEN: z.string().min(1).optional(),
    BRIVIO_API_KEY: z.string().min(1).optional(),
    BRIVIO_API_URL: z.url().default("https://api.brivio.ro"),
    CONTACT_TO_EMAIL: z.email().optional(),
    CONTACT_FROM_EMAIL: z.email().optional(),
    CONTACT_HOOK_URL: z.url().optional(),
    CONTACT_HOOK_SECRET: z.string().min(16).optional(),
    SENTRY_DSN: z.string().url().optional(),
});

const clientSchema = z.object({
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
});

export const serverEnv = serverSchema.parse({
    GITHUB_TOKEN: process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN,
    BRIVIO_API_KEY: process.env.BRIVIO_API_KEY,
    BRIVIO_API_URL: process.env.BRIVIO_API_URL || undefined,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
    CONTACT_HOOK_URL: process.env.CONTACT_HOOK_URL,
    CONTACT_HOOK_SECRET: process.env.CONTACT_HOOK_SECRET,
    SENTRY_DSN: process.env.SENTRY_DSN,
});

export const clientEnv = clientSchema.parse(rawClientEnv);
