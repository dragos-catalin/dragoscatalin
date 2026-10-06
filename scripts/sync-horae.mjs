#!/usr/bin/env node
/**
 * Sync the Horae (Wear OS watch faces) teaser + live list into src/data/horae.json.
 *
 * Vercel cannot read the watch-faces repo, so this runs locally and the JSON is committed.
 *   - live faces  = rows of docs/store/play-apps.csv (the apps published on Google Play)
 *   - names       = site/src/data/faces.json (generated from the catalog), id fallback
 *   - built count = faces/<dir> modules that have a build.gradle.kts
 *
 *   node scripts/sync-horae.mjs [--from <path to watch-faces>] [--check]
 *
 * --check exits 1 when the committed JSON differs from what the repo would produce.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "src", "data", "horae.json");

function parseArgs(argv) {
    const args = { from: process.env.HORAE_REPO ?? null, check: false };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--from") args.from = argv[++i] ?? null;
        else if (a === "--check") args.check = true;
        else throw new Error(`unknown argument: ${a}`);
    }
    return args;
}

function findRepo(explicit) {
    const candidates = [
        explicit,
        path.resolve(ROOT, "..", "watch-faces"),
        path.resolve(ROOT, "..", "..", "..", "watch-faces"),
        "E:/gh/watch-faces",
    ].filter(Boolean);
    const hit = candidates.find((c) => existsSync(path.join(c, "docs", "store", "play-apps.csv")));
    if (!hit) throw new Error(`watch-faces repo not found (tried ${candidates.join(", ")})`);
    return hit;
}

/** Minimal CSV for simple unquoted rows (play-apps.csv has no commas inside fields). */
function readCsv(file) {
    const [head, ...rows] = readFileSync(file, "utf8").trim().split(/\r?\n/);
    const cols = head.split(",");
    return rows
        .filter((r) => r.trim())
        .map((r) => Object.fromEntries(r.split(",").map((v, i) => [cols[i], v.trim()])));
}

function titles(repo) {
    const file = path.join(repo, "site", "src", "data", "faces.json");
    if (!existsSync(file)) return new Map();
    const data = JSON.parse(readFileSync(file, "utf8"));
    return new Map((data.faces ?? []).map((f) => [f.package, f.title]));
}

function builtCount(repo) {
    const dir = path.join(repo, "faces");
    return readdirSync(dir, { withFileTypes: true }).filter(
        (d) => d.isDirectory() && existsSync(path.join(dir, d.name, "build.gradle.kts")),
    ).length;
}

export function build(repo) {
    const names = titles(repo);
    const rows = readCsv(path.join(repo, "docs", "store", "play-apps.csv"));
    const faces = rows.map((r) => {
        if (!/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/.test(r.package))
            throw new Error(`bad package: ${r.package}`);
        if (r.tier !== "FREE" && r.tier !== "PAID") throw new Error(`bad tier: ${r.tier}`);
        return {
            id: r.faceId,
            name: names.get(r.package) ?? r.faceId,
            tier: r.tier === "FREE" ? "free" : "paid",
            package: r.package,
            url: `https://play.google.com/store/apps/details?id=${r.package}`,
        };
    });
    return {
        source: "watch-faces/docs/store/play-apps.csv",
        built: builtCount(repo),
        live: faces.length,
        faces,
    };
}

const args = parseArgs(process.argv.slice(2));
const repo = findRepo(args.from);
const next = `${JSON.stringify(build(repo), null, 2)}\n`;
if (args.check) {
    const cur = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
    if (cur.replace(/\r\n/g, "\n") !== next) {
        console.error(
            "[sync-horae] src/data/horae.json is stale — run node scripts/sync-horae.mjs",
        );
        process.exitCode = 1;
    } else console.log("[sync-horae] up to date");
} else {
    writeFileSync(OUT, next);
    const d = JSON.parse(next);
    console.log(
        `[sync-horae] ${d.built} faces built, ${d.live} live -> ${path.relative(ROOT, OUT)}`,
    );
}
