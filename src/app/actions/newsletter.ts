"use server";

import { randomUUID } from "node:crypto";
import { checkBotId } from "botid/server";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { locales } from "@/i18n/routing";
import { serverEnv } from "@/lib/env";
import { NEWSLETTER_CONSENT_VERSION } from "@/lib/newsletter";
import { localeUrl } from "@/lib/seo";

export type NewsletterState = {
    ok: boolean;
    /** `pending` = confirmation email sent; `subscribed` = already confirmed earlier. */
    status?: "pending" | "subscribed";
    code?: "disabled" | "error" | "invalid" | "rate";
};

const schema = z.object({
    email: z.email().max(320),
    consent: z.literal("on"),
    /** honeypot — must stay empty */
    company: z.string().max(0),
    locale: z.enum(locales),
});

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) hits.clear();
    return recent.length > RATE_LIMIT;
}

const BRIVIO_TIMEOUT_MS = 10_000;

/**
 * Double opt-in through Brivio `POST /v1/marketing/subscribers`
 * (scope `marketing_subscribers:write`). Brivio sends the confirmation email
 * and, after the click, 303s to our `/newsletter/confirmed` page.
 */
export async function subscribeAction(
    _prev: NewsletterState,
    formData: FormData,
): Promise<NewsletterState> {
    const parsed = schema.safeParse({
        email: formData.get("email"),
        consent: formData.get("consent") ?? "",
        company: formData.get("company") ?? "",
        locale: formData.get("locale") ?? "en",
    });
    if (!parsed.success) {
        if (parsed.error.issues.some((i) => i.path[0] === "company"))
            return { ok: true, status: "pending" };
        return { ok: false, code: "invalid" };
    }

    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
    if (rateLimited(ip || "unknown")) return { ok: false, code: "rate" };

    const { isBot } = await checkBotId();
    if (isBot) return { ok: false, code: "error" };

    const key = serverEnv.BRIVIO_API_KEY;
    if (!key) return { ok: false, code: "disabled" };

    const { email, locale } = parsed.data;
    const t = await getTranslations({ locale, namespace: "newsletter" });
    try {
        const res = await fetch(`${serverEnv.BRIVIO_API_URL}/v1/marketing/subscribers`, {
            method: "POST",
            headers: {
                authorization: `Bearer ${key}`,
                "content-type": "application/json",
                "idempotency-key": randomUUID(),
            },
            body: JSON.stringify({
                email: email.toLowerCase(),
                locale,
                source: "dragoscatalin.ro/newsletter",
                redirect_url: localeUrl(locale, "/newsletter/confirmed"),
                consent: {
                    text_version: NEWSLETTER_CONSENT_VERSION,
                    text: t("consent"),
                    ...(ip ? { ip } : {}),
                    user_agent: (h.get("user-agent") ?? "").slice(0, 300),
                },
            }),
            signal: AbortSignal.timeout(BRIVIO_TIMEOUT_MS),
        });
        if (res.status === 429) return { ok: false, code: "rate" };
        if (!res.ok) {
            console.error("[newsletter] brivio subscribe failed", res.status);
            return { ok: false, code: res.status === 422 ? "invalid" : "error" };
        }
        const body = (await res.json()) as { data?: { status?: string } };
        return { ok: true, status: body.data?.status === "subscribed" ? "subscribed" : "pending" };
    } catch (err) {
        console.error("[newsletter] subscribe failed", err instanceof Error ? err.name : "unknown");
        return { ok: false, code: "error" };
    }
}
