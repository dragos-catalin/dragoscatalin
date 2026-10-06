"use client";

import { useSyncExternalStore } from "react";

let seconds = 0;

function read(): number {
    seconds = Math.floor(performance.now() / 1000);
    return seconds;
}

/** Ticks once a second, and only while the tab is visible (no work in hidden tabs). */
function subscribe(onChange: () => void): () => void {
    let timer: ReturnType<typeof setInterval> | undefined;
    const tick = () => {
        read();
        onChange();
    };
    const sync = () => {
        if (document.visibilityState === "visible") {
            tick();
            timer ??= setInterval(tick, 1000);
        } else if (timer !== undefined) {
            clearInterval(timer);
            timer = undefined;
        }
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
        document.removeEventListener("visibilitychange", sync);
        if (timer !== undefined) clearInterval(timer);
    };
}

function formatUptime(total: number): string {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Seconds since this page session started; "--:--" until hydrated. */
export function Uptime() {
    const value = useSyncExternalStore<number | null>(
        subscribe,
        () => seconds,
        () => null,
    );
    return (
        <span className="text-fg tabular-nums">
            {value === null ? "--:--" : formatUptime(value)}
        </span>
    );
}
