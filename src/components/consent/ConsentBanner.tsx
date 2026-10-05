"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Cookie, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useConsent } from "./ConsentProvider";

function Switch({
    checked,
    disabled,
    onChange,
    labelId,
    descId,
}: {
    checked: boolean;
    disabled?: boolean;
    onChange?: (v: boolean) => void;
    labelId: string;
    descId: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-labelledby={labelId}
            aria-describedby={descId}
            disabled={disabled}
            onClick={() => onChange?.(!checked)}
            className={cn(
                "relative inline-flex h-7 w-12 shrink-0 items-center rounded-pill border transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-60",
                checked ? "border-accent bg-accent" : "border-line-strong bg-surface-raised",
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    "inline-block size-5 rounded-pill shadow-elev-1 transition-transform duration-200 ease-out-expo",
                    checked ? "translate-x-6 bg-accent-fg" : "translate-x-1 bg-fg-muted",
                )}
            />
        </button>
    );
}

function Preferences() {
    const t = useTranslations("consent");
    const { consent, prefsOpen, save, closePreferences } = useConsent();
    const ref = useRef<HTMLDialogElement>(null);
    const ids = useId();
    const stored = consent !== "pending" && consent !== null ? consent.analytics : false;
    const [draft, setDraft] = useState<{ open: boolean; analytics: boolean }>({
        open: false,
        analytics: stored,
    });
    // Reset the draft to the stored choice each time the dialog opens (adjust-during-render).
    if (draft.open !== prefsOpen) setDraft({ open: prefsOpen, analytics: stored });

    useEffect(() => {
        const d = ref.current;
        if (!d) return;
        if (prefsOpen && !d.open) d.showModal();
        if (!prefsOpen && d.open) d.close();
    }, [prefsOpen]);

    const rows = [
        { key: "necessary", checked: true, disabled: true },
        { key: "analytics", checked: draft.analytics, disabled: false },
    ] as const;

    return (
        <dialog
            ref={ref}
            aria-labelledby={`${ids}-title`}
            onClose={closePreferences}
            className="surface m-auto w-[min(36rem,calc(100vw-2rem))] rounded-card p-0 text-fg shadow-elev-3 backdrop:bg-bg-deep/70 backdrop:backdrop-blur-sm open:pop-in"
        >
            <div className="flex items-start justify-between gap-4 border-b border-line px-6 pt-6 pb-4">
                <div>
                    <h2 id={`${ids}-title`} className="text-lg font-semibold tracking-tight">
                        {t("prefsTitle")}
                    </h2>
                    <p className="mt-1 text-sm text-fg-muted">{t("prefsIntro")}</p>
                </div>
                <button
                    type="button"
                    onClick={closePreferences}
                    aria-label={t("close")}
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill text-fg-muted transition-colors hover:bg-accent-soft hover:text-fg"
                >
                    <X className="size-5" aria-hidden />
                </button>
            </div>
            <ul className="divide-y divide-line px-6">
                {rows.map((r) => (
                    <li key={r.key} className="flex items-start justify-between gap-6 py-4">
                        <div>
                            <p id={`${ids}-${r.key}`} className="font-medium">
                                {t(`categories.${r.key}.title`)}
                                {r.disabled ? (
                                    <span className="ml-2 rounded-pill bg-accent-soft px-2 py-0.5 text-xs font-medium text-fg">
                                        {t("alwaysOn")}
                                    </span>
                                ) : null}
                            </p>
                            <p id={`${ids}-${r.key}-d`} className="mt-1 text-sm text-fg-muted">
                                {t(`categories.${r.key}.body`)}
                            </p>
                        </div>
                        <Switch
                            checked={r.checked}
                            disabled={r.disabled}
                            labelId={`${ids}-${r.key}`}
                            descId={`${ids}-${r.key}-d`}
                            onChange={(v) => setDraft((d) => ({ ...d, analytics: v }))}
                        />
                    </li>
                ))}
            </ul>
            <div className="flex flex-col-reverse gap-2 border-t border-line px-6 py-4 sm:flex-row sm:justify-end">
                <Button variant="secondary" onClick={() => save({ analytics: false })}>
                    {t("rejectAll")}
                </Button>
                <Button variant="secondary" onClick={() => save({ analytics: draft.analytics })}>
                    {t("saveChoice")}
                </Button>
                <Button variant="secondary" onClick={() => save({ analytics: true })}>
                    {t("acceptAll")}
                </Button>
            </div>
        </dialog>
    );
}

export function ConsentBanner() {
    const t = useTranslations("consent");
    const { consent, save, openPreferences } = useConsent();
    const ids = useId();
    const showBanner = consent === null;

    return (
        <>
            {showBanner ? (
                <section
                    aria-labelledby={`${ids}-t`}
                    aria-describedby={`${ids}-d`}
                    className="sheet-in fixed inset-x-3 bottom-3 z-50 pb-[env(safe-area-inset-bottom)] sm:inset-x-auto sm:left-6 sm:bottom-6 sm:max-w-md"
                >
                    <div className="surface rounded-card p-5 shadow-elev-3">
                        <div className="flex items-center gap-2.5">
                            <span className="inline-flex size-8 items-center justify-center rounded-pill bg-accent-soft text-accent">
                                <Cookie className="size-4" aria-hidden />
                            </span>
                            <h2 id={`${ids}-t`} className="text-sm font-semibold text-fg">
                                {t("title")}
                            </h2>
                        </div>
                        <p id={`${ids}-d`} className="mt-3 text-sm leading-relaxed text-fg-muted">
                            {t("body")}{" "}
                            <Link
                                href="/privacy"
                                className="link-inline text-fg underline underline-offset-4"
                            >
                                {t("policy")}
                            </Link>
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => save({ analytics: false })}
                            >
                                {t("rejectAll")}
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => save({ analytics: true })}
                            >
                                {t("acceptAll")}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="col-span-2"
                                onClick={openPreferences}
                            >
                                {t("customize")}
                            </Button>
                        </div>
                    </div>
                </section>
            ) : null}
            <Preferences />
        </>
    );
}

/** Footer entry point: lets visitors change or withdraw consent at any time (GDPR art. 7(3)). */
export function ConsentSettingsButton({ className }: { className?: string }) {
    const t = useTranslations("consent");
    const { openPreferences } = useConsent();
    return (
        <button type="button" onClick={openPreferences} className={className}>
            {t("settings")}
        </button>
    );
}
