"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useAllowed } from "./ConsentProvider";

/** Vercel Analytics + Speed Insights load ONLY after the visitor opted in to "analytics". */
export function ConsentedAnalytics() {
    const allowed = useAllowed("analytics");
    if (!allowed) return null;
    return (
        <>
            <Analytics />
            <SpeedInsights />
        </>
    );
}
