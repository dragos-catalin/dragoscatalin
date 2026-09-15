// Generate optimised brand assets from the 1024² master logo.
// Run: node scripts/optimize-assets.mjs   (sharp ships with Next.js)
import { mkdir, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);
// pnpm isolates sharp under next's tree; resolve it from there (no extra dependency).
const nextRequire = createRequire(require.resolve("next/package.json"));
const sharp = nextRequire("sharp");

const SRC = "public/logo.png";
const OUT = [
    { file: "public/logo-64.webp", size: 64, fmt: "webp" },
    { file: "public/logo-128.webp", size: 128, fmt: "webp" },
    { file: "public/icon-192.png", size: 192, fmt: "png" },
    { file: "public/icon-512.png", size: 512, fmt: "png" },
    { file: "public/apple-icon.png", size: 180, fmt: "png" },
    { file: "src/app/icon.png", size: 48, fmt: "png" },
    // Browsers request /favicon.ico implicitly; without a file the request falls
    // through to the [locale] route and 500s. PNG payload inside ICO is fine.
    { file: "src/app/favicon.ico", size: 32, fmt: "ico" },
];

await mkdir("public", { recursive: true });
for (const o of OUT) {
    const p = sharp(SRC).resize(o.size, o.size, { fit: "cover" });
    if (o.fmt === "ico") {
        const png = await p.png({ compressionLevel: 9, palette: true }).toBuffer();
        await writeFile(o.file, icoFromPng(png, o.size));
    } else if (o.fmt === "webp") {
        await p.webp({ quality: 88, effort: 6 }).toFile(o.file);
    } else {
        await p.png({ compressionLevel: 9, palette: true }).toFile(o.file);
    }
    const { size } = await stat(o.file);
    console.log(`${o.file.padEnd(28)} ${o.size}² ${(size / 1024).toFixed(1)} KB`);
}
console.log(
    `source ${SRC}: ${((await stat(join(SRC))).size / 1024).toFixed(0)} KB (kept for /press)`,
);

/** Minimal ICO container with one PNG-encoded image (all modern browsers). */
function icoFromPng(png, size) {
    const h = Buffer.alloc(22);
    h.writeUInt16LE(0, 0); // reserved
    h.writeUInt16LE(1, 2); // type: icon
    h.writeUInt16LE(1, 4); // image count
    h.writeUInt8(size, 6); // width
    h.writeUInt8(size, 7); // height
    h.writeUInt8(0, 8); // palette
    h.writeUInt8(0, 9); // reserved
    h.writeUInt16LE(1, 10); // planes
    h.writeUInt16LE(32, 12); // bpp
    h.writeUInt32LE(png.length, 14); // data size
    h.writeUInt32LE(22, 18); // data offset
    return Buffer.concat([h, png]);
}
