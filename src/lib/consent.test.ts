import { describe, expect, it } from "vitest";
import {
    CONSENT_COOKIE,
    CONSENT_MAX_AGE_DAYS,
    CONSENT_VERSION,
    consentCookieString,
    makeConsent,
    parseConsent,
    readConsentCookie,
    serializeConsent,
} from "./consent";

const NOW = 1_790_000_000_000;

describe("consent", () => {
    it("round-trips a stored choice", () => {
        const c = makeConsent({ analytics: true }, NOW);
        expect(parseConsent(serializeConsent(c), NOW)).toEqual({
            v: CONSENT_VERSION,
            at: NOW,
            analytics: true,
        });
    });

    it("treats missing or malformed values as no choice", () => {
        expect(parseConsent(undefined, NOW)).toBeNull();
        expect(parseConsent("", NOW)).toBeNull();
        expect(parseConsent("%7Bnot-json", NOW)).toBeNull();
        expect(parseConsent(encodeURIComponent('{"v":1,"at":1}'), NOW)).toBeNull();
        expect(
            parseConsent(encodeURIComponent('{"v":1,"at":1,"analytics":"yes"}'), NOW),
        ).toBeNull();
    });

    it("asks again after the version changes", () => {
        const old = encodeURIComponent(
            JSON.stringify({ v: CONSENT_VERSION - 1, at: NOW, analytics: true }),
        );
        expect(parseConsent(old, NOW)).toBeNull();
    });

    it("asks again after the choice expires", () => {
        const c = makeConsent({ analytics: true }, NOW);
        const later = NOW + (CONSENT_MAX_AGE_DAYS + 1) * 86_400_000;
        expect(parseConsent(serializeConsent(c), later)).toBeNull();
    });

    it("rejects timestamps from the future", () => {
        const c = makeConsent({ analytics: true }, NOW + 3_600_000);
        expect(parseConsent(serializeConsent(c), NOW)).toBeNull();
    });

    it("reads the cookie among others", () => {
        const c = makeConsent({ analytics: false }, NOW);
        const header = `a=1; ${CONSENT_COOKIE}=${serializeConsent(c)}; dc-theme=x`;
        expect(readConsentCookie(header, NOW)?.analytics).toBe(false);
    });

    it("writes a first-party, lax, 6-month cookie", () => {
        const s = consentCookieString(makeConsent({ analytics: false }, NOW), true);
        expect(s).toContain(`${CONSENT_COOKIE}=`);
        expect(s).toContain(`max-age=${CONSENT_MAX_AGE_DAYS * 86_400}`);
        expect(s).toContain("samesite=lax");
        expect(s).toContain("; secure");
    });
});
