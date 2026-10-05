"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import {
    type Consent,
    type OptionalCategory,
    consentCookieString,
    makeConsent,
    readConsentCookie,
} from "@/lib/consent";

/** "pending" = server render / before hydration: show nothing, run nothing optional. */
type Snapshot = Consent | null | "pending";

const listeners = new Set<() => void>();
let prefsOpen = false;
let cached: { raw: string; value: Consent | null } | null = null;

function readSnapshot(): Consent | null {
    const raw = document.cookie;
    if (cached?.raw !== raw) cached = { raw, value: readConsentCookie(raw) };
    return cached.value;
}

function subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
}

function emit() {
    for (const l of listeners) l();
}

interface ConsentApi {
    consent: Snapshot;
    prefsOpen: boolean;
    save: (choice: Record<OptionalCategory, boolean>) => void;
    openPreferences: () => void;
    closePreferences: () => void;
}

const Ctx = createContext<ConsentApi | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
    const consent = useSyncExternalStore<Snapshot>(subscribe, readSnapshot, () => "pending");
    const open = useSyncExternalStore(
        subscribe,
        () => prefsOpen,
        () => false,
    );

    const save = useCallback((choice: Record<OptionalCategory, boolean>) => {
        const before = readSnapshot();
        document.cookie = consentCookieString(makeConsent(choice), location.protocol === "https:");
        prefsOpen = false;
        // Withdrawal must stop processing: scripts already executed are only removed by a reload.
        if (before?.analytics && !choice.analytics) {
            location.reload();
            return;
        }
        emit();
    }, []);

    const api = useMemo<ConsentApi>(
        () => ({
            consent,
            prefsOpen: open,
            save,
            openPreferences: () => {
                prefsOpen = true;
                emit();
            },
            closePreferences: () => {
                prefsOpen = false;
                emit();
            },
        }),
        [consent, open, save],
    );

    return <Ctx value={api}>{children}</Ctx>;
}

export function useConsent(): ConsentApi {
    const v = useContext(Ctx);
    if (!v) throw new Error("useConsent must be used inside <ConsentProvider>");
    return v;
}

/** True only after the visitor explicitly allowed the category. */
export function useAllowed(category: OptionalCategory): boolean {
    const { consent } = useConsent();
    return consent !== "pending" && consent !== null && consent[category];
}
