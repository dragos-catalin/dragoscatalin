#!/usr/bin/env node
/**
 * pre-commit gate. Env switches:
 *   SKIP_HOOKS=1  → skip everything
 *   FAST_COMMIT=1 → structural checks only (tracker, messages, version/CHANGELOG gate)
 */
import { readFileSync, statSync } from "node:fs";
import { acquireLock, releaseLock } from "./lib/commit-lock.mjs";
import { fail, printTimings, run } from "./lib/run.mjs";

if (process.env.SKIP_HOOKS === "1") {
    console.log("pre-commit: SKIP_HOOKS=1 → skipped");
    process.exit(0);
}

const fast = process.env.FAST_COMMIT === "1";
const phases = [];
const NODE_ENV = { NODE_OPTIONS: "--max-old-space-size=4096" };

function phase(name, fn) {
    const t = performance.now();
    const ok = fn();
    phases.push({ name, ms: performance.now() - t, ok });
    if (!ok) {
        printTimings(phases);
        releaseLock();
        process.exit(1);
    }
}

function git(args) {
    const r = run("git", args, { quiet: true });
    if (r.status !== 0) fail(`git ${args.join(" ")} failed`, [r.stderr.trim()]);
    return r.stdout;
}

acquireLock();
process.on("exit", () => {
    /* lock is released by post-commit on success; release here only on failure paths */
});

const staged = git(["diff", "--cached", "--name-only", "--diff-filter=ACMR"])
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

if (staged.length === 0) {
    console.log("pre-commit: nothing staged");
    releaseLock();
    process.exit(0);
}

const has = (re) => staged.some((f) => re.test(f));
const srcChanged = has(/^(src|messages|public)\//);
const tsChanged = has(/\.(ts|tsx|mts)$/);
const msgChanged = has(/^messages\/.*\.json$/);
const trackerChanged = has(/^docs\/(tracker\.csv|TRACKER\.md)$/);

console.log(`pre-commit: ${staged.length} staged file(s)${fast ? " [FAST_COMMIT]" : ""}`);

// ---- structural gates (always) -------------------------------------------
phase("version+changelog gate", () => {
    if (!srcChanged) return true;
    const headPkg = run("git", ["show", "HEAD:package.json"], { quiet: true });
    const headVersion = headPkg.status === 0 ? JSON.parse(headPkg.stdout).version : null;
    const workVersion = JSON.parse(readFileSync("package.json", "utf8")).version;
    const pkgStaged = staged.includes("package.json");
    const bumped = headVersion !== null && headVersion !== workVersion && pkgStaged;
    const hints = [];
    if (headVersion !== null && !bumped) {
        hints.push(
            `package.json version is still ${headVersion} but src/, messages/ or public/ changed.`,
            "npm version --no-git-tag-version patch   (or minor / major)",
            "git add package.json",
        );
    }
    if (!staged.includes("CHANGELOG.md")) {
        hints.push(
            "CHANGELOG.md must be staged with an entry under ## [Unreleased] or the new version.",
            "git add CHANGELOG.md",
        );
    }
    if (hints.length) {
        console.error("\n✖ version / CHANGELOG gate");
        for (const h of hints) console.error(`   → ${h}`);
        console.error(
            "   (bypass once with FAST_COMMIT=1 only for non-release fixups; SKIP_HOOKS=1 skips everything)",
        );
        return false;
    }
    return true;
});

phase("check-tracker", () =>
    trackerChanged || srcChanged ? run("node", ["scripts/check-tracker.mjs"]).status === 0 : true,
);

phase("check-messages", () =>
    msgChanged ? run("node", ["scripts/check-messages.mjs"]).status === 0 : true,
);

phase("check-shots-manifest", () =>
    has(/^public\/shots\//) ? run("node", ["scripts/check-shots-manifest.mjs"]).status === 0 : true,
);

// Lighthouse 2026-09-15: a 1.3 MB logo.png in the header cost ~1.5 s of LCP.
// Any staged binary under public/ or src/app/ above the budget fails unless allowlisted.
const ASSET_BUDGET_KB = 300;
const ASSET_ALLOW = new Set(["public/logo.png" /* press-kit master, not in the hot path */]);
phase("asset size gate", () => {
    const heavy = staged
        .filter((f) => /^(public|src\/app)\/.*\.(png|jpe?g|webp|avif|gif|svg|ico|woff2?)$/i.test(f))
        .filter((f) => !ASSET_ALLOW.has(f) && !f.startsWith("public/shots/"))
        .map((f) => ({ f, kb: Math.round(statSync(f).size / 1024) }))
        .filter((x) => x.kb > ASSET_BUDGET_KB);
    if (heavy.length === 0) return true;
    console.error(`\n✖ asset size gate (> ${ASSET_BUDGET_KB} KB)`);
    for (const h of heavy)
        console.error(`   → ${h.f}  ${h.kb} KB — run: node scripts/optimize-assets.mjs`);
    return false;
});

if (fast) {
    printTimings(phases);
    console.log("pre-commit: FAST_COMMIT=1 → skipped lint/typecheck/tests");
    process.exit(0);
}

// ---- code gates ------------------------------------------------------------
phase("lint-staged", () => run("pnpm", ["exec", "lint-staged"], { env: NODE_ENV }).status === 0);

phase("typecheck", () =>
    tsChanged ? run("pnpm", ["exec", "tsc", "--noEmit"], { env: NODE_ENV }).status === 0 : true,
);

phase("vitest --changed", () =>
    has(/^src\//)
        ? run("pnpm", ["exec", "vitest", "run", "--changed", "--passWithNoTests"], {
              env: NODE_ENV,
          }).status === 0
        : true,
);

printTimings(phases);
console.log("pre-commit: ok");
