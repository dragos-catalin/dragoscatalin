/**
 * Cookie consent model (Law 506/2004 art. 4(5), ePrivacy art. 5(3), GDPR art. 7).
 * Plain TS, no zod: imported by globally mounted client components.
 *
 * - `necessary` is always true (theme, locale, this cookie) and cannot be refused.
 * - Optional categories default to false; nothing optional runs before a stored choice.
 * - A choice expires after CONSENT_MAX_AGE_DAYS or when CONSENT_VERSION changes.
 */
export const CONSENT_COOKIE = "dc-consent";
/** Bump when categories or purposes change: every visitor is asked again. */
export const CONSENT_VERSION = 1;
/** ~6 months, the common EU DPA guidance for re-asking. */
export const CONSENT_MAX_AGE_DAYS = 182;

export const OPTIONAL_CATEGORIES = ["analytics"] as const;
export type OptionalCategory = (typeof OPTIONAL_CATEGORIES)[number];

export interface Consent {
    v: number;
    /** epoch ms when the choice was made */
    at: number;
    analytics: boolean;
}

export function makeConsent(choice: Record<OptionalCategory, boolean>, now = Date.now()): Consent {
    return { v: CONSENT_VERSION, at: now, analytics: choice.analytics === true };
}

export function serializeConsent(c: Consent): string {
    return encodeURIComponent(JSON.stringify(c));
}

/** Returns null for missing, malformed, outdated or expired values (= ask again). */
export function parseConsent(raw: string | null | undefined, now = Date.now()): Consent | null {
    if (!raw) return null;
    try {
        const data: unknown = JSON.parse(decodeURIComponent(raw));
        if (!data || typeof data !== "object") return null;
        const { v, at, analytics } = data as Record<string, unknown>;
        if (v !== CONSENT_VERSION) return null;
        if (typeof at !== "number" || !Number.isFinite(at) || at > now + 60_000) return null;
        if (now - at > CONSENT_MAX_AGE_DAYS * 86_400_000) return null;
        if (typeof analytics !== "boolean") return null;
        return { v, at, analytics };
    } catch {
        return null;
    }
}

export function readConsentCookie(cookieHeader: string, now = Date.now()): Consent | null {
    const m = cookieHeader.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
    return parseConsent(m?.[1], now);
}

export function consentCookieString(c: Consent, secure: boolean): string {
    const maxAge = CONSENT_MAX_AGE_DAYS * 86_400;
    return `${CONSENT_COOKIE}=${serializeConsent(c)}; path=/; max-age=${maxAge}; samesite=lax${secure ? "; secure" : ""}`;
}
