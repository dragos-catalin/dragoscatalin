// Generate every icon from the Keystone SVG masters in brand/logo (brand/src/build.mjs).
// Run: node scripts/optimize-assets.mjs   (sharp ships with Next.js)
// Sizes: brand-system references/platform-icons.md (web set: ico 16/32/48, SVG, apple-touch 180,
// manifest 192/512 + 512 maskable with the mark inside the 80 % safe circle).
import { copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// pnpm isolates sharp under next's tree; resolve it from there (no extra dependency).
const nextRequire = createRequire(require.resolve("next/package.json"));
const sharp = nextRequire("sharp");

const LOGO = "brand/logo";
const svg = (f) => readFile(`${LOGO}/${f}`);
const TILE = "#0f1219";

/** Render an SVG master to a square PNG buffer. */
async function png(file, size) {
    return sharp(await svg(file), { density: Math.max(72, (72 * size) / 48) })
        .resize(size, size)
        .png({ compressionLevel: 9 })
        .toBuffer();
}

/** Mark scaled into a full-bleed tile (maskable / apple-touch: the OS applies its own mask). */
async function fullBleed(size, scale) {
    const inner = Math.round(size * scale);
    const mark = await sharp(await svg("mark-bare.svg"), { density: (72 * inner) / 48 })
        .resize(inner, inner)
        .png()
        .toBuffer();
    return sharp({ create: { width: size, height: size, channels: 4, background: TILE } })
        .composite([{ input: mark, gravity: "centre" }])
        .png({ compressionLevel: 9 })
        .toBuffer();
}

const OUT = [
    { file: "public/icon-192.png", make: () => png("mark.svg", 192) },
    { file: "public/icon-512.png", make: () => png("mark.svg", 512) },
    // Android maskable safe zone = circle of 40 % radius; the D corners need scale 0.82.
    { file: "public/icon-maskable-512.png", make: () => fullBleed(512, 0.82) },
    // iOS rounds the corners itself and forbids transparency.
    { file: "src/app/apple-icon.png", make: () => fullBleed(180, 0.92) },
    // Press-kit master (linked from /press).
    { file: "public/logo.png", make: () => png("mark.svg", 1024) },
    // Browsers request /favicon.ico implicitly; without a file the request falls through to
    // the [locale] route and 500s. 16 px uses the pixel-tuned cut (thicker carved C).
    {
        file: "src/app/favicon.ico",
        make: async () =>
            ico([
                [16, await png("mark-16.svg", 16)],
                [32, await png("mark.svg", 32)],
                [48, await png("mark.svg", 48)],
            ]),
    },
];

await mkdir("public", { recursive: true });
for (const o of OUT) {
    await writeFile(o.file, await o.make());
    const { size } = await stat(o.file);
    console.log(`${o.file.padEnd(32)} ${(size / 1024).toFixed(1)} KB`);
}

// SVG favicon (Next file convention src/app/icon.svg) = the master mark, verbatim.
await copyFile(`${LOGO}/mark.svg`, "src/app/icon.svg");
console.log("src/app/icon.svg                 copied from brand/logo/mark.svg");

// Superseded by the inline SVG mark (header) and the file conventions above.
for (const old of [
    "public/logo-64.webp",
    "public/logo-128.webp",
    "public/apple-icon.png",
    "src/app/icon.png",
])
    await rm(old, { force: true });

/** ICO container with PNG-encoded images (all modern browsers). */
function ico(images) {
    const head = Buffer.alloc(6 + 16 * images.length);
    head.writeUInt16LE(0, 0); // reserved
    head.writeUInt16LE(1, 2); // type: icon
    head.writeUInt16LE(images.length, 4);
    let offset = head.length;
    images.forEach(([size, data], i) => {
        const e = 6 + 16 * i;
        head.writeUInt8(size >= 256 ? 0 : size, e);
        head.writeUInt8(size >= 256 ? 0 : size, e + 1);
        head.writeUInt8(0, e + 2); // palette
        head.writeUInt8(0, e + 3); // reserved
        head.writeUInt16LE(1, e + 4); // planes
        head.writeUInt16LE(32, e + 6); // bpp
        head.writeUInt32LE(data.length, e + 8);
        head.writeUInt32LE(offset, e + 12);
        offset += data.length;
    });
    return Buffer.concat([head, ...images.map(([, d]) => d)]);
}
