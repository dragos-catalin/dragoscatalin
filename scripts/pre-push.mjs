#!/usr/bin/env node
/** pre-push gate: lint, typecheck, unit tests, build (warning scan), size budget. SKIP_HOOKS=1 bypasses. */
import { printTimings, run } from "./lib/run.mjs";

if (process.env.SKIP_HOOKS === "1") {
    console.log("pre-push: SKIP_HOOKS=1 → skipped");
    process.exit(0);
}

const env = { NODE_OPTIONS: "--max-old-space-size=4096", CI: "1" };
const phases = [];

/** Lines that contain "warn" but are not actionable. */
const BENIGN = [
    /ExperimentalWarning/i,
    /npm warn/i,
    /deprecated/i, // dependency deprecation notices come from pnpm, not our code
    /Compiled with warnings/i, // followed by the actual lines which we still catch
    /warnings? during .*collect/i,
];

function phase(name, fn) {
    const t = performance.now();
    const ok = fn();
    phases.push({ name, ms: performance.now() - t, ok });
    if (!ok) {
        printTimings(phases);
        console.error(`\n✖ pre-push failed at "${name}"`);
        process.exit(1);
    }
}

phase("lint", () => run("pnpm", ["lint"], { env }).status === 0);
phase("typecheck", () => run("pnpm", ["typecheck"], { env }).status === 0);
phase("test", () => run("pnpm", ["test"], { env }).status === 0);
phase("build", () => {
    const r = run("pnpm", ["build"], { env });
    if (r.status !== 0) return false;
    const warnings = r.output
        .split(/\r?\n/)
        .filter((l) => /warn/i.test(l))
        .filter((l) => !BENIGN.some((re) => re.test(l)));
    if (warnings.length) {
        console.error("\n✖ next build emitted warnings:");
        for (const w of warnings) console.error(`   ${w.trim()}`);
        return false;
    }
    return true;
});
phase("size", () => run("pnpm", ["size"], { env }).status === 0);

printTimings(phases);
console.log("pre-push: ok");
