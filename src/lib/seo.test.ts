import { describe, expect, it } from "vitest";
import { localeAlternates, localeUrl, ogImageUrl } from "./seo";
import { site } from "./site";

describe("localeUrl", () => {
    it("omits the prefix for the default locale", () => {
        expect(localeUrl("en", "/")).toBe(`${site.url}/`);
        expect(localeUrl("en", "/projects")).toBe(`${site.url}/projects`);
    });

    it("prefixes non-default locales", () => {
        expect(localeUrl("ro", "/projects")).toBe(`${site.url}/ro/projects`);
        expect(localeUrl("ro", "/")).toBe(`${site.url}/ro/`);
    });

    it("never produces double slashes or trailing slashes on paths", () => {
        for (const url of [
            localeUrl("ro", "/projects/"),
            localeUrl("en", "//about"),
            localeUrl("ro", "/a//b/"),
        ]) {
            expect(url.replace(/^https?:\/\//, "")).not.toContain("//");
        }
        expect(localeUrl("ro", "/projects/")).toBe(`${site.url}/ro/projects`);
    });
});

describe("localeAlternates", () => {
    it("includes both locales, x-default and a canonical", () => {
        const alt = localeAlternates("ro", "/projects/codai");
        expect(alt.canonical).toBe(`${site.url}/ro/projects/codai`);
        expect(alt.languages).toEqual({
            en: `${site.url}/projects/codai`,
            ro: `${site.url}/ro/projects/codai`,
            "x-default": `${site.url}/projects/codai`,
        });
    });
});

describe("ogImageUrl", () => {
    it("appends /opengraph-image without a double slash", () => {
        expect(ogImageUrl("en", "/")).toBe(`${site.url}/opengraph-image`);
        expect(ogImageUrl("ro", "/projects/codai")).toBe(
            `${site.url}/ro/projects/codai/opengraph-image`,
        );
    });
});
