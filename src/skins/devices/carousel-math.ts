/** Pure helpers for the devices-skin 3D carousel (V3-07). No DOM, no React — unit-tested. */

export type Device = "watch" | "phone" | "desktop" | "tv";

/** Slide width in rem; the CSS reads the same value through `--dv-slide-w`. */
export const SLIDE_WIDTH_REM = 16;
/** Air between neighbouring slides on the ring, in rem. */
export const SLIDE_GAP_REM = 3;
/** Pointer travel (px) below which a press is still a click, so links inside slides keep working. */
export const CLICK_SLOP_PX = 8;
/** Minimum horizontal drag (px) that rotates the ring by at least one slide. */
export const SWIPE_MIN_PX = 40;
/** Drag distance (px) that equals one slide of rotation. */
export const PX_PER_SLIDE = 220;
/** Auto-advance period, only while untouched, visible and in view. */
export const AUTO_ADVANCE_MS = 6000;

/** Always-positive modulo: -1 of 5 → 4. */
export function wrapIndex(i: number, n: number): number {
    if (n <= 0) return 0;
    return ((i % n) + n) % n;
}

export function anglePerSlide(n: number): number {
    return n > 0 ? 360 / n : 0;
}

/** Fixed position of slide `i` on the ring, in degrees. */
export function slideAngle(i: number, n: number): number {
    return i * anglePerSlide(n);
}

/** Radius (rem) at which `n` slides of `width` sit edge to edge with `gap` between them. */
export function ringRadius(n: number, width = SLIDE_WIDTH_REM, gap = SLIDE_GAP_REM): number {
    if (n < 3) return width;
    const r = (width + gap) / 2 / Math.tan(Math.PI / n);
    return Math.round(r * 100) / 100;
}

/**
 * Ring rotation (deg) for an unwrapped `step` plus a live drag offset. `step` is never wrapped,
 * so going from the last slide to the first keeps turning the same way instead of spinning back.
 */
export function ringRotation(step: number, n: number, dragPx = 0): number {
    const a = anglePerSlide(n);
    return (dragPx / PX_PER_SLIDE) * a - step * a;
}

/** True once the pointer moved far enough that the gesture is a drag, not a click. */
export function exceedsSlop(dx: number, slop = CLICK_SLOP_PX): boolean {
    return Math.abs(dx) > slop;
}

/** Steps to rotate after a drag of `dx` px: right = previous (negative), left = next. */
export function dragSteps(dx: number, min = SWIPE_MIN_PX, perSlide = PX_PER_SLIDE): number {
    const abs = Math.abs(dx);
    if (abs < min) return 0;
    const steps = Math.max(1, Math.round(abs / perSlide));
    return dx > 0 ? -steps : steps;
}

const DEVICE_PATTERNS: [Device, RegExp][] = [
    ["watch", /\b(wear|watch)\b/i],
    ["tv", /\b(tv|tizen|signage|cast)\b/i],
    ["phone", /\b(android|ios|mobile|phone|expo)\b/i],
    ["desktop", /\b(desktop|web|windows|tauri|console|pwa|vs code|panel)\b/i],
];

/** Devices a project ships on, from its registry surface labels (e.g. "Wear OS", "Android TV"). */
export function devicesFor(surfaceLabels: readonly string[]): Device[] {
    return DEVICE_PATTERNS.filter(([, re]) => surfaceLabels.some((l) => re.test(l))).map(
        ([d]) => d,
    );
}

/** The wall's preferred frame for this slot if the project runs there, else its first real one. */
export function pickDevice(surfaceLabels: readonly string[], preferred: Device): Device {
    const supported = devicesFor(surfaceLabels);
    if (supported.includes(preferred)) return preferred;
    return supported[0] ?? "desktop";
}
