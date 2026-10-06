/** The subset of `navigator` the low-end gate reads (deviceMemory/connection are not in lib.dom). */
export interface SkyNavigator {
    hardwareConcurrency?: number;
    deviceMemory?: number;
    connection?: { saveData?: boolean };
    webdriver?: boolean;
}

export interface SkyEnv {
    navigator: SkyNavigator;
    prefersReducedMotion: boolean;
    hasWebGL2: () => boolean;
}

/**
 * DESIGN.md § Skins "Canvas guardrails": the R3F sky only mounts on capable, motion-tolerant,
 * non-automated devices. Every `false` leaves the static SVG poster as the whole experience.
 * WebGL2 is probed last because creating a context is the only expensive check.
 */
export function canMountSky({ navigator: nav, prefersReducedMotion, hasWebGL2 }: SkyEnv): boolean {
    if (prefersReducedMotion) return false;
    if (nav.webdriver === true) return false;
    if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4) return false;
    if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) return false;
    if (nav.connection?.saveData === true) return false;
    return hasWebGL2();
}

/** Probe WebGL2 support and release the throwaway context immediately. */
export function probeWebGL2(): boolean {
    try {
        const gl = document.createElement("canvas").getContext("webgl2");
        if (!gl) return false;
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        return true;
    } catch {
        return false;
    }
}
