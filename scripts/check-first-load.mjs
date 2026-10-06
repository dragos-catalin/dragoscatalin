#!/usr/bin/env node
/**
 * First-load JS budget, measured the way a visitor pays for it: for every
 * prerendered page in `.next/server/app/**\/*.html`, gzip (level 9) every
 * `/_next/static/chunks/*.js` the HTML references and sum them. The heaviest
 * page must stay within `budgetKB` from `first-load-budget.json`.
 *
 * Replaces size-limit's "sum of every chunk" (2026-10-05): Turbopack splits
 * shared code into per-route copies, so that sum counted code no visitor ever
 * downloads together (+23 kB phantom growth when the header dropped next/image).
 *
 * Run after `pnpm build`. Exit 1 when over budget or when no pages were found.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = process.cwd();
const APP = join(ROOT, ".next/server/app");
const CHUNKS = join(ROOT, ".next/static/chunks");
const { budgetKB, top = 8 } = JSON.parse(readFileSync(join(ROOT, "first-load-budget.json"), "utf8"));

if (!existsSync(APP)) {
    console.error("✖ first-load: .next/server/app not found — run `pnpm build` first");
    process.exit(1);
}

const htmls = [];
(function walk(dir) {
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) walk(p);
        else if (p.endsWith(".html")) htmls.push(p);
    }
})(APP);

const gzCache = new Map();
function gz(file) {
    if (!gzCache.has(file)) gzCache.set(file, gzipSync(readFileSync(join(CHUNKS, file)), { level: 9 }).length);
    return gzCache.get(file);
}

const pages = htmls.map((h) => {
    const html = readFileSync(h, "utf8");
    const chunks = [...new Set([...html.matchAll(/\/_next\/static\/chunks\/([^"'?\s]+\.js)/g)].map((m) => m[1]))].filter(
        (c) => existsSync(join(CHUNKS, c)),
    );
    const bytes = chunks.reduce((sum, c) => sum + gz(c), 0);
    return { page: "/" + relative(APP, h).replaceAll("\\", "/").replace(/\.html$/, ""), kb: bytes / 1000, chunks: chunks.length };
});

const measured = pages.filter((p) => p.chunks > 0).sort((a, b) => b.kb - a.kb);
if (measured.length === 0) {
    console.error("✖ first-load: no prerendered page references any JS chunk");
    process.exit(1);
}

for (const p of measured.slice(0, top))
    console.log(`  ${p.kb.toFixed(1).padStart(7)} kB  ${String(p.chunks).padStart(2)} chunks  ${p.page}`);

const worst = measured[0];
const line = `first-load JS: heaviest page ${worst.page} = ${worst.kb.toFixed(1)} kB gz (budget ${budgetKB} kB, ${measured.length} pages)`;
if (worst.kb > budgetKB) {
    console.error(`✖ ${line}`);
    process.exit(1);
}
console.log(`✔ ${line}`);
