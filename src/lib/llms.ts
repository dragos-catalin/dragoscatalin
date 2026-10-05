import { cacheLife } from "next/cache";
import en from "../../messages/en.json";
import { allPackages, projects } from "@/data/projects";
import type { Project } from "@/data/types";
import { site } from "@/lib/site";

const PAGES: { label: string; path: string }[] = [
    { label: "Projects", path: "/projects" },
    { label: "Open source", path: "/open-source" },
    { label: "About", path: "/about" },
    { label: "Now", path: "/now" },
    { label: "Uses", path: "/uses" },
    { label: "Press kit", path: "/press" },
    { label: "Privacy & cookies", path: "/privacy" },
];

function header(): string {
    return [
        `# ${site.name}`,
        "",
        `> ${en.meta.description} Site of ${site.fullName}, full-stack developer based in Romania.`,
        "",
    ].join("\n");
}

function projectUrl(p: Project): string {
    return `${site.url}/projects/${p.slug}`;
}

function packageUrl(registry: string, name: string): string {
    return registry === "pypi"
        ? `https://pypi.org/project/${name}/`
        : `https://www.npmjs.com/package/${name}`;
}

function linksSection(): string[] {
    const lines = ["## Links", ""];
    for (const pg of PAGES) lines.push(`- [${pg.label}](${site.url}${pg.path})`);
    for (const [key, url] of Object.entries(site.socials)) lines.push(`- [${key}](${url})`);
    lines.push(`- [Projects JSON API](${site.url}/api/projects)`);
    lines.push(`- [RSS feed](${site.url}/feed.xml)`);
    lines.push("");
    return lines;
}

export async function buildLlmsTxt(): Promise<string> {
    "use cache";
    cacheLife("days");

    const lines = [header(), "## Projects", ""];
    for (const p of projects) lines.push(`- [${p.name}](${projectUrl(p)}): ${p.tagline.en}`);
    lines.push("", "## Open source", "");
    for (const pkg of allPackages)
        lines.push(`- [${pkg.name} (${pkg.registry})](${packageUrl(pkg.registry, pkg.name)})`);
    lines.push(
        "",
        ...linksSection(),
        "## Optional",
        "",
        `- [Full project details](${site.url}/llms-full.txt)`,
        "",
    );
    return lines.join("\n");
}

function years(p: Project): string {
    return `${p.years.from}–${p.years.to ?? "now"}`;
}

export async function buildLlmsFullTxt(): Promise<string> {
    "use cache";
    cacheLife("days");

    const lines = [header()];
    for (const p of projects) {
        lines.push(`## ${p.name}`, "");
        lines.push(`- URL: ${projectUrl(p)}`);
        lines.push(`- Status: ${p.status}`);
        lines.push(`- Category: ${p.category}`);
        lines.push(`- Years: ${years(p)}`);
        lines.push(`- Stack: ${p.stack.join(", ")}`);
        if (p.surfaces?.length)
            lines.push(
                `- Surfaces: ${p.surfaces.map((s) => (s.url ? `${s.label} (${s.url})` : s.label)).join(", ")}`,
            );
        if (p.visibility === "public" && p.repos?.length)
            lines.push(
                `- Repos: ${p.repos.map((r) => `https://github.com/${r.owner}/${r.name}`).join(", ")}`,
            );
        if (p.website) lines.push(`- Website: ${p.website}`);
        lines.push("", p.summary.en, "");
        if (p.disclaimer) lines.push(`> Note: ${p.disclaimer.en}`, "");
    }
    lines.push("## About", "", en.about.intro, "", `### ${en.about.values.title}`, "");
    for (const v of en.about.values.items) lines.push(`- **${v.title}** — ${v.body}`);
    lines.push("", ...linksSection());
    return lines.join("\n");
}
