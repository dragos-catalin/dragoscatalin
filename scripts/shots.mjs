#!/usr/bin/env node
/**
 * Weekly project screenshots (Playwright, dependency-free beyond @playwright/test).
 *
 * Targets come from `${SHOTS_BASE_URL ?? https://dragoscatalin.ro}/api/projects`:
 * every non-archived project with a `website`, plus any http(s) `surfaces[].url`
 * (deduped). Output: public/shots/<slug>/<viewport>-<scheme>.jpg, a full-page
 * `full-dark.jpg` (max 4000px tall) and public/shots/manifest.json.
 *
 * Optional authenticated internal pages: `shots.config.json` at repo root
 * (shape documented in docs/CI.md → "Screenshots").
 *
 *   node scripts/shots.mjs [--only slug,slug] [--force] [--base http://localhost:24789] [--dry-run]
 */
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "shots");
const MANIFEST_PATH = path.join(OUT_DIR, "manifest.json");
const CONFIG_PATH = path.join(ROOT, "shots.config.json");

const VIEWPORTS = {
    desktop: { width: 1440, height: 900 },
    tablet: { width: 1024, height: 1366 },
    mobile: { width: 390, height: 844 },
};
const SCHEMES = ["dark", "light"];
const FULL_MAX_HEIGHT = 4000;
const STALE_MS = 6 * 24 * 60 * 60 * 1000;
const CONCURRENCY = 3;
const COOKIE_RE = /accept|agree|ok|got it|accept\u0103|de acord/i;

// ---------- CLI ----------
function parseArgs(argv) {
    const args = { only: null, force: false, base: null, dryRun: false, help: false };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--force") args.force = true;
        else if (a === "--dry-run") args.dryRun = true;
        else if (a === "--help" || a === "-h") args.help = true;
        else if (a === "--only") args.only = (argv[++i] ?? "").split(",").filter(Boolean);
        else if (a.startsWith("--only=")) args.only = a.slice(7).split(",").filter(Boolean);
        else if (a === "--base") args.base = argv[++i] ?? null;
        else if (a.startsWith("--base=")) args.base = a.slice(7);
        else {
            console.error(`Unknown argument: ${a}`);
            args.help = true;
        }
    }
    return args;
}

function usage() {
    console.log(
        `Usage: node scripts/shots.mjs [--only slug,slug] [--force] [--base URL] [--dry-run]\n\n` +
            `  --only     comma-separated project slugs\n` +
            `  --force    re-capture even if files exist and manifest entry is fresh\n` +
            `  --base     site base URL for /api/projects (default $SHOTS_BASE_URL or https://dragoscatalin.ro)\n` +
            `  --dry-run  print targets without launching a browser`,
    );
}

// ---------- helpers ----------
const log = (...m) => console.log(`[shots] ${m.join(" ")}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function readJson(file, fallback) {
    try {
        return JSON.parse(await readFile(file, "utf8"));
    } catch {
        return fallback;
    }
}

function isHttp(u) {
    return typeof u === "string" && /^https?:\/\//i.test(u);
}

async function pool(items, limit, worker) {
    const queue = [...items];
    const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
        while (queue.length) await worker(queue.shift());
    });
    await Promise.all(runners);
}

// ---------- targets ----------
async function loadTargets(base, only, config) {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/projects`);
    if (!res.ok) throw new Error(`GET /api/projects → ${res.status}`);
    const { projects } = await res.json();
    const targets = [];
    for (const p of projects) {
        if (p.status === "archived") continue;
        if (only && !only.includes(p.slug)) continue;
        const urls = [];
        if (isHttp(p.website)) urls.push(p.website);
        for (const s of p.surfaces ?? [])
            if (isHttp(s.url) && !urls.includes(s.url)) urls.push(s.url);
        if (urls.length === 0) continue;
        const cfg = config[p.slug] ?? {};
        targets.push({
            slug: p.slug,
            url: urls[0],
            extraUrls: urls.slice(1),
            pages: Array.isArray(cfg.pages) ? cfg.pages : [],
            storageStateSecret: cfg.storageStateSecret ?? null,
        });
    }
    return targets;
}

function expectedFiles(target) {
    const files = {};
    for (const vp of Object.keys(VIEWPORTS))
        for (const sc of SCHEMES) files[`${vp}-${sc}`] = `${vp}-${sc}.jpg`;
    files["full-dark"] = "full-dark.jpg";
    for (const pg of target.pages)
        for (const vp of Object.keys(VIEWPORTS))
            for (const sc of SCHEMES)
                files[`${pg.name}-${vp}-${sc}`] = `${pg.name}-${vp}-${sc}.jpg`;
    return files;
}

function isFresh(target, manifest) {
    const entry = manifest.shots?.[target.slug];
    if (!entry?.capturedAt) return false;
    if (Date.now() - Date.parse(entry.capturedAt) > STALE_MS) return false;
    return Object.values(expectedFiles(target)).every((f) =>
        existsSync(path.join(OUT_DIR, target.slug, f)),
    );
}

// ---------- capture ----------
async function gotoRobust(page, url) {
    try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
    } catch {
        await page.goto(url, { waitUntil: "load", timeout: 45_000 });
    }
    try {
        await page.addStyleTag({
            content: `[class*="cookie"],[id*="cookie"]{display:none!important}`,
        });
    } catch {
        /* ignore */
    }
    try {
        const btn = page.getByRole("button", { name: COOKIE_RE }).first();
        await btn.click({ timeout: 2_000 });
    } catch {
        /* no banner */
    }
    await sleep(800);
}

async function shoot(page, file, opts = {}) {
    await page.screenshot({ path: file, type: "jpeg", quality: 82, ...opts });
}

async function captureTarget(browser, target, manifest, force) {
    if (!force && isFresh(target, manifest)) {
        log(`skip ${target.slug} (fresh)`);
        return;
    }
    const dir = path.join(OUT_DIR, target.slug);
    await mkdir(dir, { recursive: true });

    let storageState;
    if (target.storageStateSecret && process.env[target.storageStateSecret]) {
        const tmp = await mkdtemp(path.join(tmpdir(), "shots-"));
        storageState = path.join(tmp, "state.json");
        await writeFile(storageState, process.env[target.storageStateSecret], "utf8");
    }

    const files = {};
    const record = (key, rel, width, height) => {
        files[key] = { path: `shots/${target.slug}/${rel}`, width, height };
    };

    for (const [vp, size] of Object.entries(VIEWPORTS)) {
        for (const sc of SCHEMES) {
            const context = await browser.newContext({
                viewport: size,
                colorScheme: sc,
                deviceScaleFactor: 1,
                ...(storageState ? { storageState } : {}),
            });
            const page = await context.newPage();
            await page.emulateMedia({ colorScheme: sc });
            try {
                await gotoRobust(page, target.url);
                const rel = `${vp}-${sc}.jpg`;
                await shoot(page, path.join(dir, rel));
                record(`${vp}-${sc}`, rel, size.width, size.height);

                if (vp === "desktop" && sc === "dark") {
                    const full = await page.evaluate(() => document.documentElement.scrollHeight);
                    const h = Math.min(full, FULL_MAX_HEIGHT);
                    await shoot(page, path.join(dir, "full-dark.jpg"), {
                        clip: { x: 0, y: 0, width: size.width, height: h },
                        fullPage: true,
                    });
                    record("full-dark", "full-dark.jpg", size.width, h);
                }

                for (const pg of target.pages) {
                    try {
                        await gotoRobust(page, new URL(pg.path, target.url).href);
                        const prel = `${pg.name}-${vp}-${sc}.jpg`;
                        await shoot(page, path.join(dir, prel));
                        record(`${pg.name}-${vp}-${sc}`, prel, size.width, size.height);
                    } catch (e) {
                        log(`warn ${target.slug} page ${pg.name} ${vp}-${sc}: ${e.message}`);
                    }
                }
            } catch (e) {
                log(`warn ${target.slug} ${vp}-${sc}: ${e.message}`);
            } finally {
                await context.close();
            }
        }
    }

    if (Object.keys(files).length === 0) {
        log(`fail ${target.slug}: no screenshots produced`);
        return;
    }
    manifest.shots[target.slug] = {
        url: target.url,
        capturedAt: new Date().toISOString(),
        files,
    };
    log(`done ${target.slug} (${Object.keys(files).length} files)`);
}

// ---------- main ----------
async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) return usage();
    const base = args.base ?? process.env.SHOTS_BASE_URL ?? "https://dragoscatalin.ro";
    const config = await readJson(CONFIG_PATH, {});
    const targets = await loadTargets(base, args.only, config);

    log(`base=${base} targets=${targets.length}`);
    for (const t of targets) {
        const extra = t.extraUrls.length ? ` (+${t.extraUrls.length} surface url)` : "";
        const pages = t.pages.length ? ` pages=${t.pages.map((p) => p.name).join(",")}` : "";
        log(`  ${t.slug} → ${t.url}${extra}${pages}`);
    }
    if (args.dryRun) return;

    await mkdir(OUT_DIR, { recursive: true });
    const manifest = await readJson(MANIFEST_PATH, { generatedAt: null, shots: {} });
    manifest.shots ??= {};

    const browser = await chromium.launch();
    try {
        await pool(targets, CONCURRENCY, (t) =>
            captureTarget(browser, t, manifest, args.force).catch((e) =>
                log(`fail ${t.slug}: ${e.message}`),
            ),
        );
    } finally {
        await browser.close();
    }

    manifest.generatedAt = new Date().toISOString();
    await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");
    log(`manifest written → ${path.relative(ROOT, MANIFEST_PATH)}`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
