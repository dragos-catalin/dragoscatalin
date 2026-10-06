"use client";

import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { canMountSky, probeWebGL2, type SkyNavigator } from "./gate";

// three + R3F live only in this lazily imported chunk; the page's initial JS never contains them.
const SkyScene = lazy(() => import("./SkyScene"));

const IDLE_FALLBACK_MS = 1500;

/** Resolve after window `load` (LCP is past) and then an idle slot. Returns a cancel function. */
function afterLoadAndIdle(run: () => void): () => void {
    let cancelled = false;
    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const scheduleIdle = () => {
        if (cancelled) return;
        if (typeof window.requestIdleCallback === "function") {
            idleId = window.requestIdleCallback(() => !cancelled && run(), {
                timeout: IDLE_FALLBACK_MS * 2,
            });
        } else {
            timer = setTimeout(() => !cancelled && run(), IDLE_FALLBACK_MS);
        }
    };

    if (document.readyState === "complete") scheduleIdle();
    else window.addEventListener("load", scheduleIdle, { once: true });

    return () => {
        cancelled = true;
        window.removeEventListener("load", scheduleIdle);
        if (idleId !== undefined) window.cancelIdleCallback(idleId);
        if (timer !== undefined) clearTimeout(timer);
    };
}

/**
 * Client gate for the V3-05 sky (DESIGN.md § Skins "Canvas guardrails"). Renders nothing until
 * the page has loaded and gone idle, then only on capable devices (see `canMountSky`). The SVG
 * poster stays in the DOM underneath; `.cs-sky-live` on the section cross-fades it out once the
 * canvas has painted its first frame.
 */
export function SkyCanvasIsland({ flags }: { flags: number }) {
    const [mount, setMount] = useState(false);
    const [live, setLive] = useState(false);

    useEffect(
        () =>
            afterLoadAndIdle(() => {
                const ok = canMountSky({
                    navigator: navigator as Navigator & SkyNavigator,
                    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
                        .matches,
                    hasWebGL2: probeWebGL2,
                });
                if (ok) setMount(true);
            }),
        [],
    );

    const onFirstFrame = useCallback(() => setLive(true), []);

    if (!mount) return null;
    return (
        <div aria-hidden="true" className="cs-canvas" data-live={live ? "" : undefined}>
            <Suspense fallback={null}>
                <SkyScene flags={flags} onFirstFrame={onFirstFrame} />
            </Suspense>
        </div>
    );
}
