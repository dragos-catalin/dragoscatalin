import { spawnSync } from "node:child_process";

const isWin = process.platform === "win32";

/** Format ms as "1.2s". */
export function fmt(ms) {
    return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
}

/**
 * Run a command synchronously, streaming output to the terminal AND
 * returning it. Returns { status, ms, stdout, stderr, output }.
 */
export function run(cmd, args = [], { env = {}, cwd = process.cwd(), quiet = false, label } = {}) {
    const title = label ?? [cmd, ...args].join(" ");
    if (!quiet) console.log(`\n▶ ${title}`);
    const started = performance.now();
    const res = spawnSync(cmd, args, {
        cwd,
        env: { ...process.env, FORCE_COLOR: "1", ...env },
        encoding: "utf8",
        shell: isWin, // resolves pnpm.cmd / node etc.
        stdio: ["inherit", "pipe", "pipe"],
        maxBuffer: 64 * 1024 * 1024,
    });
    const ms = performance.now() - started;
    const stdout = res.stdout ?? "";
    const stderr = res.stderr ?? "";
    if (!quiet) {
        if (stdout) process.stdout.write(stdout);
        if (stderr) process.stderr.write(stderr);
    }
    const status = res.status ?? (res.error ? 1 : 0);
    if (!quiet) console.log(`${status === 0 ? "✔" : "✖"} ${title} (${fmt(ms)})`);
    return { status, ms, stdout, stderr, output: stdout + stderr, error: res.error };
}

/** Print a failure box with hints and exit(1). */
export function fail(title, hints = []) {
    console.error(`\n✖ ${title}`);
    for (const h of hints) console.error(`   → ${h}`);
    console.error("");
    process.exit(1);
}

/** Print a timing table sorted slowest first. */
export function printTimings(phases) {
    const rows = [...phases].sort((a, b) => b.ms - a.ms);
    if (rows.length === 0) return;
    const w = Math.max(...rows.map((r) => r.name.length));
    console.log("\nPhases (slowest first):");
    for (const r of rows)
        console.log(`  ${r.name.padEnd(w)}  ${fmt(r.ms).padStart(8)}  ${r.ok ? "ok" : "FAIL"}`);
}
