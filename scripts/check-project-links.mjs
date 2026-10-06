#!/usr/bin/env node
/**
 * Link health for the project registry (V3-14).
 *
 * Reads src/data/projects.ts (+ src/data/horae.json) WITHOUT a TS loader: it imports
 * the registry through Node's type stripping (node >= 24 strips `import type` and
 * annotations), then HEAD/GETs every live website, surface URL, store URL and
 * published listing. Paused projects' websites are checked too, but a failure there is
 * expected and reported as "paused", not as broken.
 *
 *   node scripts/check-project-links.mjs [--json out.json] [--timeout 15000] [--retries 2]
 *
 * Exit 1 when any non-paused URL answers 4xx/5xx (402 included) or fails to connect.
 * Not part of vitest (network); runs weekly in .github/workflows/links.yml.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
    const a = { json: null, timeout: 15000, retries: 2, concurrency: 6 };
    for (let i = 0; i < argv.length; i++) {
        const k = argv[i];
        if (k === "--json") a.json = argv[++i];
        else if (k === "--timeout") a.timeout = Number(argv[++i]);
        else if (k === "--retries") a.retries = Number(argv[++i]);
        else if (k === "--concurrency") a.concurrency = Number(argv[++i]);
        else throw new Error(`unknown argument: ${k}`);
    }
    return a;
}

async function loadRegistry() {
    // projects.ts imports "./horae" (extensionless) and horae.ts imports a .json; resolve
    // both with in-thread hooks so plain node can run the registry with type stripping.
    const { registerHooks } = await import("node:module");
    registerHooks({
        resolve(spec, ctx, next) {
            if (spec.startsWith(".") && !/\.[cm]?[jt]sx?$|\.json$/.test(spec)) {
                try {
                    return next(`${spec}.ts`, ctx);
                } catch {
                    /* fall through */
                }
            }
            if (spec.endsWith(".json")) {
                const r = next(spec, { ...ctx, importAttributes: { type: "json" } });
                return { ...r, importAttributes: { type: "json" } };
            }
            return next(spec, ctx);
        },
    });
    const mod = await import(pathToFileURL(path.join(ROOT, "src", "data", "projects.ts")).href);
    return mod.projects;
}

function collect(projects) {
    const out = new Map();
    const add = (url, slug, kind, paused) => {
        if (typeof url !== "string" || !/^https?:\/\//.test(url)) return;
        const prev = out.get(url);
        if (prev) {
            prev.refs.push(`${slug}:${kind}`);
            prev.paused = prev.paused && paused;
        } else out.set(url, { url, refs: [`${slug}:${kind}`], paused });
    };
    for (const p of projects) {
        if (p.status === "archived") continue;
        const paused = p.status === "paused";
        const siteHost = p.website ? new URL(p.website).hostname : null;
        add(p.website, p.slug, "website", paused);
        for (const s of p.surfaces ?? [])
            add(
                s.url,
                p.slug,
                "surface",
                paused && siteHost === new URL(s.url ?? "http://x").hostname,
            );
        for (const s of p.stores ?? []) add(s.url, p.slug, `store:${s.store}`, false);
        for (const l of p.listings ?? []) add(l.url, p.slug, `listing:${l.store}`, false);
    }
    return [...out.values()];
}

const UA = "Mozilla/5.0 (compatible; dragoscatalin-link-check/1.0; +https://dragoscatalin.ro)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** npmjs.com answers 403 to every non-browser client; the registry API is the truth. */
function probeUrl(url) {
    const m = /^https:\/\/www\.npmjs\.com\/package\/(.+?)\/?$/.exec(url);
    return m ? `https://registry.npmjs.org/${m[1].replace("/", "%2F")}/latest` : url;
}

async function probe(url, timeout) {
    const target = probeUrl(url);
    const attempt = async (method) => {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), timeout);
        try {
            const r = await fetch(target, {
                method,
                redirect: "follow",
                signal: ctrl.signal,
                headers: { "user-agent": UA, accept: "text/html,*/*" },
            });
            await r.body?.cancel();
            return { status: r.status };
        } finally {
            clearTimeout(t);
        }
    };
    // Many stores reject HEAD (405/403/404) — fall back to GET before judging.
    const head = await attempt("HEAD");
    if (head.status < 400) return head;
    return attempt("GET");
}

async function check(entry, opts) {
    let last = { status: 0, error: "not run" };
    for (let i = 0; i <= opts.retries; i++) {
        try {
            const r = await probe(entry.url, opts.timeout);
            last = r;
            // 4xx other than 408/429 is a definite answer; retry only transient failures.
            if (r.status < 400 || (r.status < 500 && r.status !== 408 && r.status !== 429)) break;
        } catch (e) {
            last = { status: 0, error: e?.cause?.code ?? e?.name ?? String(e) };
        }
        if (i < opts.retries) await sleep(1000 * (i + 1));
    }
    const ok = last.status >= 200 && last.status < 400;
    return { ...entry, ...last, ok };
}

async function pool(items, n, fn) {
    const out = [];
    const q = [...items];
    await Promise.all(
        Array.from({ length: Math.min(n, q.length) }, async () => {
            while (q.length) {
                const it = q.shift();
                out.push(await fn(it));
            }
        }),
    );
    return out;
}

const opts = parseArgs(process.argv.slice(2));
const projects = await loadRegistry();
const entries = collect(projects);
const results = (await pool(entries, opts.concurrency, (e) => check(e, opts))).sort((a, b) =>
    a.url.localeCompare(b.url),
);

const broken = results.filter((r) => !r.ok && !r.paused);
const pausedDown = results.filter((r) => !r.ok && r.paused);
const pausedUp = results.filter((r) => r.ok && r.paused);
for (const r of results) {
    const tag = r.ok ? (r.paused ? "UP?" : "ok ") : r.paused ? "PAU" : "BAD";
    console.log(
        `${tag} ${String(r.status || r.error).padEnd(12)} ${r.url}  [${r.refs.join(", ")}]`,
    );
}
console.log(
    `\n[links:projects] ${results.length} URLs · ${results.length - broken.length - pausedDown.length} ok · ${broken.length} broken · ${pausedDown.length} paused-down` +
        (pausedUp.length ? ` · ${pausedUp.length} paused but answering (consider un-pausing)` : ""),
);
if (opts.json)
    writeFileSync(opts.json, JSON.stringify({ results, broken: broken.length }, null, 2));
if (broken.length) process.exitCode = 1;
