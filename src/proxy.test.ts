import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import proxy from "./proxy";

const BASE = "https://dragoscatalin.ro";

function req(path: string, cookie?: string) {
    return new NextRequest(new URL(path, BASE), {
        headers: { "accept-language": "en-US,en;q=0.9", ...(cookie ? { cookie } : {}) },
    });
}

const rewriteOf = (res: Response) => res.headers.get("x-middleware-rewrite");

describe("proxy: skins", () => {
    it("leaves the home untouched without a skin cookie (next-intl only)", () => {
        const res = proxy(req("/"));
        expect(res.headers.get("location")).toBeNull();
        expect(rewriteOf(res)).toBe(`${BASE}/en`);
    });

    it("leaves the home untouched with the classic cookie", () => {
        expect(rewriteOf(proxy(req("/", "dc-skin=classic")))).toBe(`${BASE}/en`);
    });

    it("rewrites / and /ro to the skin home with a valid cookie", () => {
        const en = proxy(req("/", "dc-skin=command"));
        expect(rewriteOf(en)).toBe(`${BASE}/en/skin/command`);
        expect(en.headers.get("link")).toContain('hreflang="ro"');
        const ro = proxy(req("/ro", "dc-skin=editorial; NEXT_LOCALE=ro"));
        expect(rewriteOf(ro)).toBe(`${BASE}/ro/skin/editorial`);
    });

    it("ignores an unknown skin cookie", () => {
        expect(rewriteOf(proxy(req("/", "dc-skin=nope")))).toBe(`${BASE}/en`);
    });

    it("never rewrites content pages", () => {
        expect(rewriteOf(proxy(req("/projects", "dc-skin=command")))).toBe(`${BASE}/en/projects`);
    });

    it("404s direct hits on the internal skin routes", () => {
        expect(rewriteOf(proxy(req("/skin/editorial")))).toBe(`${BASE}/en/skin-not-found`);
        expect(rewriteOf(proxy(req("/ro/skin/command")))).toBe(`${BASE}/ro/skin-not-found`);
        expect(rewriteOf(proxy(req("/en/skin")))).toBe(`${BASE}/en/skin-not-found`);
    });

    it("?skin=<id> sets the cookie and 307s to the clean URL", () => {
        const res = proxy(req("/?skin=devices&x=1"));
        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toBe(`${BASE}/?x=1`);
        const c = res.headers.get("set-cookie") ?? "";
        expect(c).toContain("dc-skin=devices");
        expect(c).toMatch(/Max-Age=31536000/i);
        expect(c).toMatch(/Path=\//i);
        expect(c).toMatch(/SameSite=lax/i);
    });

    it("?skin=classic and invalid values clear the cookie", () => {
        for (const v of ["classic", "bogus"]) {
            const res = proxy(req(`/ro?skin=${v}`, "dc-skin=command"));
            expect(res.status).toBe(307);
            expect(res.headers.get("location")).toBe(`${BASE}/ro`);
            expect(res.headers.get("set-cookie")).toMatch(/dc-skin=;.*Max-Age=0/i);
        }
    });
});
