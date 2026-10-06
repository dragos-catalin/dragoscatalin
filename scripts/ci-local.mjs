#!/usr/bin/env node
/**
 * Run the whole CI pipeline locally, on Linux, exactly like GitHub Actions.
 *
 *   node scripts/ci-local.mjs            # Windows → re-exec inside WSL; Linux → run inline
 *   node scripts/ci-local.mjs --docker   # run inside node:24-bookworm (needs docker)
 *   node scripts/ci-local.mjs --inner    # (internal) run the pipeline in the current shell
 *   --keep-going                         # don't stop at the first failing step
 *
 * Logs: .copilot-tmp/ci-logs/<timestamp>.log
 */
import { spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fmt } from "./lib/run.mjs";

const root = resolve(import.meta.dirname, "..");
const args = new Set(process.argv.slice(2));
const inner = args.has("--inner");
const keepGoing = args.has("--keep-going");
const useDocker = args.has("--docker");
const isWin = process.platform === "win32";

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const logDir = resolve(root, ".copilot-tmp/ci-logs");
mkdirSync(logDir, { recursive: true });
const logFile = resolve(logDir, `${stamp}.log`);
const log = (s) => {
    process.stdout.write(s);
    appendFileSync(logFile, s.replace(/\x1b\[[0-9;]*m/g, ""));
};

function which(bin) {
    const r = spawnSync(isWin ? "where.exe" : "which", [bin], { encoding: "utf8" });
    return r.status === 0;
}

const INNER_CMD =
    "corepack enable && pnpm install --frozen-lockfile && node scripts/ci-local.mjs --inner" +
    (keepGoing ? " --keep-going" : "");

// ---- dispatch -------------------------------------------------------------
if (!inner) {
    if (useDocker) {
        if (!which("docker")) {
            console.error("✖ --docker requested but docker is not on PATH");
            process.exit(1);
        }
        log(`▶ docker run node:24-bookworm (repo mounted at /w)\n`);
        const r = spawnSync(
            "docker",
            [
                "run",
                "--rm",
                "-v",
                `${root}:/w`,
                "-w",
                "/w",
                "-e",
                "CI=1",
                "node:24-bookworm",
                "bash",
                "-lc",
                INNER_CMD,
            ],
            {
                stdio: "inherit",
            },
        );
        process.exit(r.status ?? 1);
    }
    if (isWin) {
        if (!which("wsl.exe")) {
            console.error("✖ wsl.exe not found. Install WSL (wsl --install) or use --docker.");
            process.exit(1);
        }
        const wp = spawnSync("wsl.exe", ["-e", "wslpath", "-a", root], { encoding: "utf8" });
        if (wp.status !== 0) {
            console.error("✖ wslpath failed:", wp.stderr);
            process.exit(1);
        }
        const linuxRoot = wp.stdout.trim();
        log(`▶ re-executing inside WSL at ${linuxRoot}\n`);
        const r = spawnSync(
            "wsl.exe",
            ["-e", "bash", "-lc", `cd '${linuxRoot}' && export CI=1 && ${INNER_CMD}`],
            { stdio: "inherit" },
        );
        process.exit(r.status ?? 1);
    }
    // already Linux/macOS → fall through to the pipeline
}

// ---- pipeline -------------------------------------------------------------
const env = {
    ...process.env,
    CI: "1",
    NODE_OPTIONS: "--max-old-space-size=4096",
    FORCE_COLOR: "1",
};
const steps = [
    ["format", "pnpm format:check"],
    ["lint", "pnpm lint"],
    ["typecheck", "pnpm typecheck"],
    ["check-messages", "node scripts/check-messages.mjs"],
    ["check-tracker", "node scripts/check-tracker.mjs"],
    ["audit", "pnpm audit --audit-level high"],
    ["test", "pnpm test -- --coverage"],
    ["build", "pnpm build"],
    ["size", "pnpm size"],
    ["playwright install", "pnpm exec playwright install --with-deps chromium"],
    // S-01: scans need a running server; start it in the background like CI does.
    [
        "start",
        "(pnpm start > .next/start.log 2>&1 &) && npx --yes wait-on@8 http://localhost:24789 --timeout 60000",
    ],
    ["contrast", "pnpm scan:contrast"],
    ["layout", "pnpm scan:layout"],
    ["e2e", "pnpm test:e2e"],
];

const results = [];
log(`\n=== ci-local ${stamp} (${process.platform} ${process.version}) → ${logFile}\n`);
for (const [name, cmd] of steps) {
    log(`\n▶ ${name}: ${cmd}\n`);
    const t = performance.now();
    const r = spawnSync(cmd, {
        shell: true,
        env,
        cwd: root,
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
    });
    const ms = performance.now() - t;
    log((r.stdout ?? "") + (r.stderr ?? ""));
    const ok = r.status === 0;
    results.push({ name, ms, ok });
    log(`${ok ? "✔" : "✖"} ${name} (${fmt(ms)})\n`);
    if (!ok && !keepGoing) break;
}

const w = Math.max(...results.map((r) => r.name.length));
log("\nSummary\n");
for (const r of results)
    log(`  ${r.name.padEnd(w)}  ${fmt(r.ms).padStart(8)}  ${r.ok ? "ok" : "FAIL"}\n`);
const skipped = steps.length - results.length;
if (skipped) log(`  (${skipped} step(s) skipped after failure)\n`);
const failed = results.filter((r) => !r.ok);
log(`\n${failed.length ? `✖ ${failed.length} failed` : "✔ all green"} — log: ${logFile}\n`);
process.exit(failed.length ? 1 : 0);
