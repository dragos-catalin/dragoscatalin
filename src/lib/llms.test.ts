import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ cacheLife: () => {}, cacheTag: () => {} }));

import { projects } from "@/data/projects";
import { buildLlmsFullTxt, buildLlmsTxt } from "./llms";
import { site } from "./site";

describe("llms.txt builders", () => {
    it("llms.txt starts with an H1 and lists every project once", async () => {
        const txt = await buildLlmsTxt();
        expect(txt.startsWith(`# ${site.name}`)).toBe(true);
        for (const p of projects)
            expect(txt).toContain(`](${site.url}/projects/${p.slug}): ${p.tagline.en}`);
        expect(txt).toContain(`${site.url}/llms-full.txt`);
        expect(txt).toContain(`${site.url}/api/projects`);
    });

    it("llms-full.txt never leaks private repo urls (public mirrors excepted)", async () => {
        const txt = await buildLlmsFullTxt();
        // Private projects list only repos in the public-mirror allowlist (registry test); the
        // builder must still suppress the "- Repos:" line for them since visibility is private.
        const privateWithRepos = projects.filter(
            (p) => p.visibility === "private" && p.repos?.length,
        );
        expect(privateWithRepos.length).toBeGreaterThan(0);
        for (const p of privateWithRepos) {
            const section = txt.split(`## ${p.name}\n`)[1]?.split("\n## ")[0] ?? "";
            expect(section, `${p.slug} section should exist`).not.toBe("");
            expect(section, `${p.slug} leaks repo list`).not.toContain("- Repos:");
        }
        const publicRepo = projects.find((p) => p.visibility === "public" && p.repos?.length)!
            .repos![0]!;
        expect(txt).toContain(`https://github.com/${publicRepo.owner}/${publicRepo.name}`);
        for (const p of projects) expect(txt).toContain(`## ${p.name}`);
    });
});
