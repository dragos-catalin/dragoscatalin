#!/usr/bin/env node
/**
 * Local Lighthouse sweep against a running server (prod build recommended).
 *   pnpm lh                       → desktop, http://localhost:24790
 *   pnpm lh -- --preset mobile    → mobile preset
 *   pnpm lh -- --base http://localhost:24789 --runs 3
 *   pnpm lh -- --skin command     → same sweep with Cookie dc-skin=command (V3-03 skins);
 *                                   --skin all = every non-classic skin, home + /projects
 * Prints P/A/BP/SEO + LCP/CLS/TBT/FCP per route; JSON reports in .copilot-tmp/lh/.
 * Uses the installed Chrome (CHROME_PATH) so results match CI's lighthouse-ci.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const opt = (name, def) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : def;
};
const base = opt("base", "http://localhost:24790");
const preset = opt("preset", "desktop");
const runs = Number(opt("runs", "1"));
const skinArg = opt("skin", "classic");
const SKIN_HOMES = ["editorial", "constellation", "command", "devices"];
const skins = skinArg === "all" ? SKIN_HOMES : [skinArg];
const defaultRoutes =
    skinArg === "classic" ? "/,/projects,/projects/codai,/about,/open-source" : "/,/projects";
const routes = opt("routes", defaultRoutes).split(",");

const OUT = ".copilot-tmp/lh";
mkdirSync(OUT, { recursive: true });

const chrome =
    process.env.CHROME_PATH ??
    [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium",
    ].find(existsSync);

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor((xs.length - 1) / 2)];
let worst = 100;

for (const skin of skins) {
    // Lighthouse --extra-headers takes a JSON file path (no shell quoting of JSON on Windows).
    let headersFile = null;
    if (skin !== "classic") {
        headersFile = `${OUT}/headers-${skin}.json`;
        writeFileSync(headersFile, JSON.stringify({ Cookie: `dc-skin=${skin}` }));
    }
    for (const route of routes) {
        const scores = { P: [], A: [], BP: [], SEO: [], LCP: [], CLS: [], TBT: [], FCP: [] };
        for (let r = 0; r < runs; r++) {
            const file = `${OUT}/${preset}${skin === "classic" ? "" : `-${skin}`}${route.replace(/\//g, "_") || "_home"}${runs > 1 ? `-${r + 1}` : ""}.json`;
            const flags = [
                `${base}${route}`,
                "--output=json",
                `--output-path=${file}`,
                "--quiet",
                "--chrome-flags=--headless=new --no-sandbox --disable-gpu",
                "--only-categories=performance,accessibility,best-practices,seo",
            ];
            if (preset === "desktop") flags.push("--preset=desktop");
            if (headersFile) flags.push(`--extra-headers=${headersFile}`);
            const res = spawnSync("pnpm", ["exec", "lighthouse", ...flags], {
                stdio: "ignore",
                shell: process.platform === "win32",
                env: { ...process.env, ...(chrome ? { CHROME_PATH: chrome } : {}) },
            });
            if (res.status !== 0 || !existsSync(file)) {
                console.error(`✖ ${preset} ${route} run ${r + 1} failed`);
                continue;
            }
            const j = JSON.parse(readFileSync(file, "utf8"));
            const c = j.categories;
            const a = j.audits;
            scores.P.push(Math.round(c.performance.score * 100));
            scores.A.push(Math.round(c.accessibility.score * 100));
            scores.BP.push(Math.round(c["best-practices"].score * 100));
            scores.SEO.push(Math.round(c.seo.score * 100));
            scores.LCP.push(Math.round(a["largest-contentful-paint"].numericValue));
            scores.CLS.push(Number(a["cumulative-layout-shift"].numericValue.toFixed(3)));
            scores.TBT.push(Math.round(a["total-blocking-time"].numericValue));
            scores.FCP.push(Math.round(a["first-contentful-paint"].numericValue));
        }
        if (scores.P.length === 0) continue;
        const m = Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, median(v)]));
        worst = Math.min(worst, m.P, m.A, m.BP, m.SEO);
        console.log(
            `${preset.padEnd(7)} ${skin.padEnd(13)} ${route.padEnd(16)} P=${String(m.P).padStart(3)} A=${String(m.A).padStart(3)} BP=${String(m.BP).padStart(3)} SEO=${String(m.SEO).padStart(3)} | LCP=${String(m.LCP).padStart(5)}ms CLS=${m.CLS} TBT=${m.TBT}ms FCP=${m.FCP}ms`,
        );
    }
}
console.log(`\nworst category score: ${worst}`);
