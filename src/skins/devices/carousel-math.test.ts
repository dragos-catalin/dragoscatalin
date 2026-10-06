import { describe, expect, it } from "vitest";
import {
    CLICK_SLOP_PX,
    PX_PER_SLIDE,
    SWIPE_MIN_PX,
    anglePerSlide,
    devicesFor,
    dragSteps,
    exceedsSlop,
    pickDevice,
    ringRadius,
    ringRotation,
    slideAngle,
    wrapIndex,
} from "./carousel-math";

describe("wrapIndex", () => {
    it("wraps past both ends", () => {
        expect(wrapIndex(0, 6)).toBe(0);
        expect(wrapIndex(6, 6)).toBe(0);
        expect(wrapIndex(7, 6)).toBe(1);
        expect(wrapIndex(-1, 6)).toBe(5);
        expect(wrapIndex(-13, 6)).toBe(5);
    });

    it("returns 0 for an empty carousel instead of NaN", () => {
        expect(wrapIndex(3, 0)).toBe(0);
    });
});

describe("angles", () => {
    it("splits the full turn evenly", () => {
        expect(anglePerSlide(6)).toBe(60);
        expect(anglePerSlide(4)).toBe(90);
        expect(anglePerSlide(0)).toBe(0);
        expect(slideAngle(0, 6)).toBe(0);
        expect(slideAngle(3, 6)).toBe(180);
        expect(slideAngle(5, 6)).toBe(300);
    });

    it("rotates the ring opposite to the step so the active slide faces front", () => {
        expect(ringRotation(0, 6)).toBe(0);
        expect(ringRotation(2, 6)).toBe(-120);
        // Unwrapped steps keep turning the same way past the last slide.
        expect(ringRotation(7, 6)).toBe(-420);
        expect(ringRotation(-1, 6)).toBe(60);
    });

    it("follows a live drag proportionally", () => {
        expect(ringRotation(0, 6, PX_PER_SLIDE)).toBe(60);
        expect(ringRotation(1, 6, -PX_PER_SLIDE / 2)).toBe(-90);
    });

    it("places slides edge to edge on the ring", () => {
        // 6 slides of 16rem + 3rem gap: apothem of a hexagon with side 19 = 19/2/tan(30°)
        expect(ringRadius(6, 16, 3)).toBeCloseTo(16.45, 2);
        expect(ringRadius(2, 16, 3)).toBe(16);
        expect(ringRadius(12)).toBeGreaterThan(ringRadius(6));
    });
});

describe("drag threshold", () => {
    it("treats small travel as a click so links still work", () => {
        expect(exceedsSlop(0)).toBe(false);
        expect(exceedsSlop(CLICK_SLOP_PX)).toBe(false);
        expect(exceedsSlop(-(CLICK_SLOP_PX + 1))).toBe(true);
    });

    it("needs a minimum swipe before rotating", () => {
        expect(dragSteps(SWIPE_MIN_PX - 1)).toBe(0);
        expect(dragSteps(-(SWIPE_MIN_PX - 1))).toBe(0);
    });

    it("maps direction and distance to steps", () => {
        expect(dragSteps(-SWIPE_MIN_PX)).toBe(1); // swipe left → next
        expect(dragSteps(SWIPE_MIN_PX)).toBe(-1); // swipe right → previous
        expect(dragSteps(-PX_PER_SLIDE * 2)).toBe(2);
        expect(dragSteps(PX_PER_SLIDE * 3.4)).toBe(-3);
    });
});

describe("device frames", () => {
    it("reads devices from registry surface labels", () => {
        expect(devicesFor(["Android", "Wear OS", "Android TV", "Desktop (Tauri)"])).toEqual([
            "watch",
            "tv",
            "phone",
            "desktop",
        ]);
        expect(devicesFor(["SDK (TS)"])).toEqual([]);
    });

    it("keeps the slot's frame when the project runs there, else falls back", () => {
        expect(pickDevice(["Android", "Wear OS"], "watch")).toBe("watch");
        expect(pickDevice(["Web"], "watch")).toBe("desktop");
        expect(pickDevice(["Android"], "tv")).toBe("phone");
        expect(pickDevice([], "phone")).toBe("desktop");
    });
});
