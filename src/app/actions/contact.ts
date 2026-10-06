"use server";

import { createHmac, randomUUID } from "node:crypto";
import { checkBotId } from "botid/server";
import { headers } from "next/headers";
import { after } from "next/server";
import { z } from "zod";
import { locales } from "@/i18n/routing";
import { serverEnv } from "@/lib/env";
import { site } from "@/lib/site";

export type ContactState = {
    ok: boolean;
    code?: "disabled" | "error" | "invalid";
    fieldErrors?: Record<string, string>;
};

const schema = z.object({
    name: z.string().trim().min(2).max(80),
    email: z.email().max(200),
    message: z.string().trim().min(20).max(4000),
    /** honeypot — must stay empty */
    website: z.string().max(0),
    locale: z.enum(locales),
});

// Best-effort, per-instance rate limit (resets on cold start / per region).
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
const HOOK_TIMEOUT_MS = 5_000;

type Message = { name: string; email: string; message: string; locale: string };

/** Sends through Brivio `POST /v1/email/send` (scope `emails:send`). */
async function sendViaBrivio(key: string, m: Message, ip: string): Promise<boolean> {
    const res = await fetch(`${serverEnv.BRIVIO_API_URL}/v1/email/send`, {
        method: "POST",
        headers: {
            authorization: `Bearer ${key}`,
            "content-type": "application/json",
            "idempotency-key": randomUUID(),
        },
        body: JSON.stringify({
            from: `dragoscatalin.ro <${serverEnv.CONTACT_FROM_EMAIL}>`,
            to: [serverEnv.CONTACT_TO_EMAIL ?? site.email],
            reply_to: `${m.name.replace(/[<>"\r\n]/g, "")} <${m.email}>`,
            subject: `[dragoscatalin.ro] ${m.name.replace(/[\r\n]/g, " ")}`,
            text: `From: ${m.name} <${m.email}>\nLocale: ${m.locale}\nIP: ${ip}\n\n${m.message}\n`,
            category: "notification",
            tags: { source: "contact-form", locale: m.locale },
        }),
        signal: AbortSignal.timeout(BRIVIO_TIMEOUT_MS),
    });
    if (!res.ok) console.error("[contact] brivio send failed", res.status);
    return res.ok;
}

/** Phone notification through the homepi Funnel hook (vmui docs/home-assistant.md). */
async function notifyHome(m: Message): Promise<void> {
    const url = serverEnv.CONTACT_HOOK_URL;
    const secret = serverEnv.CONTACT_HOOK_SECRET;
    if (!url || !secret) return;
    const body = JSON.stringify({ ...m, receivedAt: new Date().toISOString() });
    const ts = Math.floor(Date.now() / 1000).toString();
    const signature = createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex");
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-dc-timestamp": ts,
                "x-dc-nonce": randomUUID(),
                "x-dc-signature": signature,
            },
            body,
            signal: AbortSignal.timeout(HOOK_TIMEOUT_MS),
        });
        if (res.status !== 202) console.error("[contact] home hook", res.status);
    } catch (err) {
        console.error("[contact] home hook failed", err instanceof Error ? err.name : "unknown");
    }
}

export async function contactAction(
    _prev: ContactState,
    formData: FormData,
): Promise<ContactState> {
    const parsed = schema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        message: formData.get("message"),
        website: formData.get("website") ?? "",
        locale: formData.get("locale") ?? "en",
    });

    if (!parsed.success) {
        const issues = parsed.error.issues;
        // Honeypot filled: pretend success so bots learn nothing.
        if (issues.some((i) => i.path[0] === "website")) return { ok: true };
        const fieldErrors: Record<string, string> = {};
        for (const i of issues) {
            const key = String(i.path[0] ?? "form");
            fieldErrors[key] ??= i.code;
        }
        return { ok: false, code: "invalid", fieldErrors };
    }

    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
    if (rateLimited(ip)) return { ok: false, code: "error" };

    // Vercel BotID (invisible; outside Vercel it reports humans, so local dev keeps working).
    const { isBot } = await checkBotId();
    if (isBot) return { ok: false, code: "error" };

    const key = serverEnv.BRIVIO_API_KEY;
    if (!key || !serverEnv.CONTACT_FROM_EMAIL) return { ok: false, code: "disabled" };

    const { name, email, message, locale } = parsed.data;
    const m: Message = { name, email, message, locale };
    try {
        if (!(await sendViaBrivio(key, m, ip))) return { ok: false, code: "error" };
        after(() => notifyHome(m));
        return { ok: true };
    } catch (err) {
        console.error("[contact] send failed", err instanceof Error ? err.name : "unknown");
        return { ok: false, code: "error" };
    }
}
