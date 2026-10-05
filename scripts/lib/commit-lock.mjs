import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const STALE_MS = 20 * 60 * 1000;

// The COMMON git dir, so every worktree of this repo shares one commit lock. In a worktree
// `--git-dir` is absolute (E:\...\.git\worktrees\x) and join(cwd, abs) produced
// "<cwd>\E:\..." -> ENOENT in pre-commit (2026-10-05). resolve() handles both forms.
function gitDir(cwd = process.cwd()) {
    const r = spawnSync("git", ["rev-parse", "--git-common-dir"], { cwd, encoding: "utf8" });
    return r.status === 0 ? resolve(cwd, r.stdout.trim()) : join(cwd, ".git");
}

export function lockPath(cwd) {
    return join(gitDir(cwd), "dc-commit.lock");
}

function pidAlive(pid) {
    if (!Number.isInteger(pid) || pid <= 0) return false;
    try {
        process.kill(pid, 0);
        return true;
    } catch (e) {
        return e.code === "EPERM";
    }
}

function readLock(p) {
    try {
        return JSON.parse(readFileSync(p, "utf8"));
    } catch {
        return null;
    }
}

/**
 * Acquire the commit lock. Returns true on success. Fails (exit 1) if another
 * live commit holds it. Stale locks (dead pid or >20min) are reclaimed.
 */
export function acquireLock(cwd = process.cwd()) {
    const p = lockPath(cwd);
    mkdirSync(dirname(p), { recursive: true });
    if (existsSync(p)) {
        const cur = readLock(p);
        const age = cur?.startedAt ? Date.now() - Date.parse(cur.startedAt) : Infinity;
        const stale = !cur || !pidAlive(cur.pid) || age > STALE_MS;
        if (!stale && cur.pid !== process.pid) {
            console.error(
                `✖ another commit is in progress (pid ${cur.pid}, started ${cur.startedAt}).`,
            );
            console.error(`   → wait 30–60s and retry; delete ${p} only if that pid is dead.`);
            process.exit(1);
        }
        if (stale)
            console.log(
                `↻ reclaiming stale commit lock (${cur ? `pid ${cur.pid}` : "unreadable"})`,
            );
    }
    writeFileSync(
        p,
        JSON.stringify({
            pid: process.pid,
            ppid: process.ppid,
            startedAt: new Date().toISOString(),
        }),
    );
    return true;
}

export function releaseLock(cwd = process.cwd()) {
    const p = lockPath(cwd);
    try {
        if (existsSync(p)) unlinkSync(p);
    } catch {
        /* best effort */
    }
}
