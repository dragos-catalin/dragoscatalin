#!/usr/bin/env node
// Validate public/shots/manifest.json structurally (mirrors src/lib/shots.schema.ts).
// shots.ts trusts the manifest at build time with no runtime zod, so this gate is
// what keeps a malformed manifest out of the tree. Run by pre-commit when staged.
import { existsSync, readFileSync } from "node:fs";

const P = "public/shots/manifest.json";
if (!existsSync(P)) {
    console.error(`✖ ${P} missing`);
    process.exit(1);
}
const m = JSON.parse(readFileSync(P, "utf8"));
const errors = [];
const iso = (s) => typeof s === "string" && !Number.isNaN(Date.parse(s));

if (!(m.generatedAt === null || iso(m.generatedAt)))
    errors.push("generatedAt must be null or ISO date");
if (typeof m.shots !== "object" || m.shots === null) errors.push("shots must be an object");
else
    for (const [slug, e] of Object.entries(m.shots)) {
        if (!/^https?:\/\//.test(e.url ?? "")) errors.push(`${slug}.url invalid`);
        if (!iso(e.capturedAt)) errors.push(`${slug}.capturedAt invalid`);
        if (typeof e.files !== "object") errors.push(`${slug}.files missing`);
        else
            for (const [k, f] of Object.entries(e.files)) {
                if (typeof f.path !== "string" || !f.path.startsWith("shots/"))
                    errors.push(`${slug}.files.${k}.path invalid`);
                if (!Number.isInteger(f.width) || f.width <= 0)
                    errors.push(`${slug}.files.${k}.width invalid`);
                if (!Number.isInteger(f.height) || f.height <= 0)
                    errors.push(`${slug}.files.${k}.height invalid`);
                if (!existsSync(`public/${f.path}`))
                    errors.push(`${slug}.files.${k}: public/${f.path} does not exist`);
            }
    }

if (errors.length) {
    console.error("✖ check-shots-manifest:");
    for (const e of errors) console.error(`   → ${e}`);
    process.exit(1);
}
console.log(`✔ check-shots-manifest: ${Object.keys(m.shots).length} project(s), files exist`);
