// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Project } from "@/data/types";
import { CoverArt } from "./CoverArt";
import { coverSeed } from "./cover";

function project(slug: string, name = "Brivio Ledger"): Project {
    return {
        slug,
        name,
        tagline: { en: "t", ro: "t" },
        summary: { en: "s", ro: "s" },
        status: "live",
        category: "product",
        visibility: "public",
        years: { from: 2024 },
        stack: ["Next.js", "Drizzle", "Postgres", "Stripe"],
        hue: 200,
    };
}

function html(p: Project): string {
    const { container, unmount } = render(<CoverArt project={p} />);
    const out = container.querySelector("svg")?.outerHTML ?? "";
    unmount();
    return out;
}

describe("CoverArt", () => {
    it("renders identically for the same slug", () => {
        expect(html(project("brivio"))).toBe(html(project("brivio")));
    });

    it("renders different markup for different slugs", () => {
        expect(html(project("brivio"))).not.toBe(html(project("codai")));
        expect(coverSeed("brivio")).not.toBe(coverSeed("codai"));
    });

    it("contains the monogram and stack chips", () => {
        const { container } = render(<CoverArt project={project("brivio")} />);
        expect(container.querySelector("[data-monogram]")?.textContent).toBe("BL");
        const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
        expect(texts).toEqual(expect.arrayContaining(["Next.js", "Drizzle", "Postgres"]));
        expect(texts).not.toContain("Stripe");
    });

    it("is decorative", () => {
        const { container } = render(<CoverArt project={project("brivio")} />);
        const svg = container.querySelector("svg");
        expect(svg?.getAttribute("aria-hidden")).toBe("true");
        expect(svg?.getAttribute("focusable")).toBe("false");
    });
});
