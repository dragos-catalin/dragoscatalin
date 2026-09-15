"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
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
    turnstileToken: z.string().optional(),
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

async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
    const secret = serverEnv.TURNSTILE_SECRET_KEY;
    if (!secret) return true;
    if (!token) return false;
    try {
        const body = new URLSearchParams({ secret, response: token });
        if (ip !== "unknown") body.set("remoteip", ip);
        const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            body,
        });
        if (!res.ok) return false;
        const json = (await res.json()) as { success?: boolean };
        return json.success === true;
    } catch {
        return false;
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
        turnstileToken: formData.get("cf-turnstile-response") ?? undefined,
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

    if (!(await verifyTurnstile(parsed.data.turnstileToken, ip)))
        return { ok: false, code: "invalid" };

    const key = serverEnv.RESEND_API_KEY;
    if (!key) return { ok: false, code: "disabled" };

    const { name, email, message, locale } = parsed.data;
    try {
        const resend = new Resend(key);
        const { error } = await resend.emails.send({
            from: serverEnv.CONTACT_FROM_EMAIL ?? "site@dragoscatalin.ro",
            to: serverEnv.CONTACT_TO_EMAIL ?? site.email,
            replyTo: email,
            subject: `[dragoscatalin.ro] ${name}`,
            text: `From: ${name} <${email}>\nLocale: ${locale}\nIP: ${ip}\n\n${message}\n`,
        });
        if (error) {
            console.error("[contact] resend error", error.name);
            return { ok: false, code: "error" };
        }
        return { ok: true };
    } catch (err) {
        console.error("[contact] send failed", err instanceof Error ? err.message : err);
        return { ok: false, code: "error" };
    }
}
