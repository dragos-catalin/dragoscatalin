#!/usr/bin/env node
/**
 * Measures the owner's own code on this machine and writes src/data/measured.json (V3-11).
 *
 * - Repos: every git repo directly under E:\gh whose origin is one of the owner's GitHub accounts
 *   or orgs (OWNERS). Clones of other people's code and repos without a remote are skipped.
 * - Languages: non-blank lines per file extension over `rg --files` (honours .gitignore/.ignore),
 *   skipping generated/vendored paths, minified bundles, .d.ts and files over 1 MB.
 * - Commits: `git rev-list --count --since=<year>-01-01 HEAD` per repo, bots excluded by author.
 * - "Also worked with": legacy tech evidenced in the 2025 tree (E:\GitHub) by package.json deps,
 *   project files or source extensions, and absent (or marginal) in the current repos.
 *
 * Run: `pnpm measure:repos` (Windows, needs rg + git). Commit the JSON it writes.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const ACTIVE_ROOT = process.env.MEASURE_ROOT ?? "E:\\gh";
const LEGACY_ROOT = process.env.MEASURE_LEGACY_ROOT ?? "E:\\GitHub";
const YEAR = Number(process.env.MEASURE_YEAR ?? new Date().getFullYear());
const OUT = resolve(import.meta.dirname, "..", "src", "data", "measured.json");

const OWNERS =
    /github\.com[/:](dragoscv|dragos-catalin|codai-ro|brivio-ro|hide-protocol|marcai-ro|scrin-app|horae-ro)\//i;
const BOT = /\[bot\]|renovate|dependabot|github-actions/i;
const LANG = {
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".mts": "TypeScript",
    ".cts": "TypeScript",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".mjs": "JavaScript",
    ".cjs": "JavaScript",
    ".kt": "Kotlin",
    ".kts": "Kotlin",
    ".rs": "Rust",
    ".py": "Python",
    ".sql": "SQL",
    ".go": "Go",
    ".cs": "C#",
    ".dart": "Dart",
    ".swift": "Swift",
    ".ps1": "PowerShell",
    ".psm1": "PowerShell",
    ".sh": "Shell",
    ".c": "C/C++",
    ".h": "C/C++",
    ".cpp": "C/C++",
    ".cc": "C/C++",
    ".hpp": "C/C++",
    ".ino": "C/C++",
    ".php": "PHP",
    ".java": "Java",
};
const SKIP =
    /(\.d\.ts|\.min\.js|\.bundle\.js)$|(^|[\\/])(vendor|third_party|generated|gen|dist|build|out|node_modules|\.next|target)[\\/]/i;
/** Below this many lines a language is noise (a stray script), not something I work in. */
const MIN_LINES = 1000;

function git(dir, args) {
    try {
        return execFileSync("git", ["-C", dir, ...args], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
            maxBuffer: 64 * 1024 * 1024,
        }).trim();
    } catch {
        return "";
    }
}

function repos(root) {
    return readdirSync(root, { withFileTypes: true })
        .filter((d) => d.isDirectory() && existsSync(join(root, d.name, ".git")))
        .map((d) => {
            const dir = join(root, d.name);
            return { name: d.name, dir, remote: git(dir, ["remote", "get-url", "origin"]) };
        });
}

function files(dir) {
    try {
        return execFileSync("rg", ["--files"], {
            cwd: dir,
            encoding: "utf8",
            maxBuffer: 512 * 1024 * 1024,
            stdio: ["ignore", "pipe", "ignore"],
        })
            .split(/\r?\n/)
            .filter(Boolean);
    } catch (e) {
        return String(e.stdout ?? "")
            .split(/\r?\n/)
            .filter(Boolean);
    }
}

function languageLines(dir) {
    const out = {};
    for (const f of files(dir)) {
        const lang = LANG[extname(f).toLowerCase()];
        if (!lang || SKIP.test(f)) continue;
        const p = join(dir, f);
        try {
            if (statSync(p).size > 1_000_000) continue;
        } catch {
            continue;
        }
        const n = readFileSync(p, "utf8")
            .split(/\r?\n/)
            .filter((l) => l.trim()).length;
        out[lang] = (out[lang] ?? 0) + n;
    }
    return out;
}

// ── Active repos ────────────────────────────────────────────────────────────
const active = repos(ACTIVE_ROOT).filter((r) => OWNERS.test(r.remote));
const totals = {};
const perRepo = [];
for (const r of active) {
    for (const [k, v] of Object.entries(languageLines(r.dir))) totals[k] = (totals[k] ?? 0) + v;
    const authors = git(r.dir, ["log", `--since=${YEAR}-01-01`, "--format=%an", "HEAD"])
        .split(/\r?\n/)
        .filter(Boolean);
    const commits = authors.filter((a) => !BOT.test(a)).length;
    perRepo.push({ name: r.name, commits });
    console.error(`${r.name}: ${commits}`);
}
const kept = Object.entries(totals).filter(([, v]) => v >= MIN_LINES);
const keptTotal = kept.reduce((s, [, v]) => s + v, 0);
const languages = kept
    .sort((a, b) => b[1] - a[1])
    .map(([name, lines]) => ({
        name,
        lines,
        share: Math.round((lines / keptTotal) * 1000) / 10,
    }));

// ── Legacy tree: evidence for "also worked with" ────────────────────────────
const LEGACY = [
    { name: "Electron", dep: /"electron"\s*:/ },
    { name: "Firebase", dep: /"firebase(-admin)?"\s*:/, file: "firebase.json" },
    { name: "React Native / Expo", dep: /"(react-native|expo)"\s*:/ },
    { name: "MongoDB", dep: /"(mongodb|mongoose)"\s*:/ },
    { name: "WinUI 3 / .NET", glob: /\.csproj$/ },
    { name: "Arduino / ESP32", glob: /\.ino$|platformio\.ini$/ },
];
const evidence = Object.fromEntries(LEGACY.map((l) => [l.name, new Set()]));
for (const r of existsSync(LEGACY_ROOT)
    ? readdirSync(LEGACY_ROOT, { withFileTypes: true }).filter((d) => d.isDirectory())
    : []) {
    const dir = join(LEGACY_ROOT, r.name);
    const list = files(dir);
    for (const l of LEGACY) {
        const hit = list.some((f) => {
            if (l.glob?.test(f)) return true;
            if (l.file && f.replace(/\\/g, "/") === l.file) return true;
            if (l.dep && /(^|[\\/])package\.json$/.test(f) && !/node_modules/.test(f)) {
                try {
                    return l.dep.test(readFileSync(join(dir, f), "utf8"));
                } catch {
                    return false;
                }
            }
            return false;
        });
        if (hit) evidence[l.name].add(r.name);
    }
}

const result = {
    measuredAt: new Date().toLocaleDateString("sv-SE"),
    method: "Repos under E:\\gh with an origin on the owner's GitHub accounts/orgs. Languages = non-blank lines over `rg --files` (gitignore-aware; generated, vendored, minified, .d.ts and >1 MB files skipped), languages under 1,000 lines dropped. Commits = git log since Jan 1 on HEAD, bots excluded. Also-worked-with = package.json deps / project files in the 2025 tree (E:\\GitHub).",
    year: YEAR,
    // Counts only: several measured repos are private or deliberately omitted from the site.
    repos: perRepo.length,
    commits: {
        total: perRepo.reduce((s, r) => s + r.commits, 0),
        reposWithCommits: perRepo.filter((r) => r.commits > 0).length,
    },
    languages,
    alsoWorkedWith: LEGACY.map((l) => ({
        name: l.name,
        repos: evidence[l.name].size,
    })).filter((l) => l.repos > 0),
};
writeFileSync(OUT, JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));
