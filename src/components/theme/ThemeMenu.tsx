"use client";

import { useEffect, useId, useRef, useState, type ComponentType, type SVGProps } from "react";
import { useTranslations } from "next-intl";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ACCENTS, MODES, SURFACES, type Accent, type Mode, type Surface } from "@/lib/theme";
import { cn } from "@/lib/utils";

const ACCENT_HUE: Record<Accent, number> = {
    ember: 42,
    orange: 50,
    violet: 300,
    indigo: 275,
    cyan: 215,
    emerald: 160,
    amber: 75,
    rose: 15,
};

const MODE_ICON: Record<Mode, ComponentType<SVGProps<SVGSVGElement>>> = {
    system: Monitor,
    light: Sun,
    dark: Moon,
};

const FOCUSABLE = 'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])';

function Segmented<T extends string>({
    label,
    value,
    options,
    onChange,
    render,
}: {
    label: string;
    value: T;
    options: readonly T[];
    onChange: (v: T) => void;
    render: (v: T) => React.ReactNode;
}) {
    return (
        <div
            role="radiogroup"
            aria-label={label}
            className="flex rounded-pill border border-line bg-bg p-1"
        >
            {options.map((opt) => {
                const active = opt === value;
                return (
                    <button
                        key={opt}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        tabIndex={active ? 0 : -1}
                        onClick={() => onChange(opt)}
                        onKeyDown={(e) => {
                            const i = options.indexOf(opt);
                            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                                e.preventDefault();
                                onChange(options[(i + 1) % options.length] as T);
                            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                                e.preventDefault();
                                onChange(options[(i - 1 + options.length) % options.length] as T);
                            }
                        }}
                        className={cn(
                            "flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-pill px-3 text-xs font-medium transition-colors",
                            active
                                ? "bg-surface-raised text-fg shadow-card"
                                : "text-fg-muted hover:text-fg",
                        )}
                    >
                        {render(opt)}
                    </button>
                );
            })}
        </div>
    );
}

export function ThemeMenu({ className }: { className?: string }) {
    const t = useTranslations("theme");
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const id = useId();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);

    // Escape / outside click, focus trap to first control, return focus on close.
    useEffect(() => {
        if (!open) return;
        const button = buttonRef.current;
        const panel = panelRef.current;
        const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
        first?.focus();

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
                return;
            }
            if (e.key === "Tab" && panel) {
                const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
                    (el) => el.tabIndex !== -1,
                );
                if (items.length === 0) return;
                const firstEl = items[0]!;
                const lastEl = items[items.length - 1]!;
                if (e.shiftKey && document.activeElement === firstEl) {
                    e.preventDefault();
                    lastEl.focus();
                } else if (!e.shiftKey && document.activeElement === lastEl) {
                    e.preventDefault();
                    firstEl.focus();
                }
            }
        };
        const onPointer = (e: PointerEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("keydown", onKey);
        document.addEventListener("pointerdown", onPointer);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("pointerdown", onPointer);
            button?.focus();
        };
    }, [open]);

    const TriggerIcon = MODE_ICON[theme.resolvedMode];

    return (
        <div ref={rootRef} className={cn("relative", className)}>
            <button
                ref={buttonRef}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={open ? id : undefined}
                aria-label={t("label")}
                onClick={() => setOpen((v) => !v)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill text-fg-muted transition-colors hover:bg-accent-soft hover:text-fg"
            >
                <TriggerIcon className="size-[18px]" aria-hidden />
            </button>

            {open ? (
                <div
                    ref={panelRef}
                    id={id}
                    role="dialog"
                    aria-label={t("label")}
                    className="pop-in surface absolute top-full right-0 z-50 mt-2 w-72 origin-top-right rounded-card p-4 shadow-elev-3"
                >
                    <div className="flex flex-col gap-4">
                        <fieldset className="flex flex-col gap-2">
                            <legend className="mb-2 font-mono text-[11px] tracking-[0.16em] text-fg-subtle uppercase">
                                {t("mode")}
                            </legend>
                            <Segmented<Mode>
                                label={t("mode")}
                                value={theme.mode}
                                options={MODES}
                                onChange={theme.setMode}
                                render={(m) => {
                                    const Icon = MODE_ICON[m];
                                    return (
                                        <>
                                            <Icon className="size-3.5" aria-hidden />
                                            <span>{t(m)}</span>
                                        </>
                                    );
                                }}
                            />
                        </fieldset>

                        <div>
                            <p className="mb-2 font-mono text-[11px] tracking-[0.16em] text-fg-subtle uppercase">
                                {t("accent")}
                            </p>
                            <div
                                role="group"
                                aria-label={t("accent")}
                                className="grid grid-cols-4 gap-2"
                            >
                                {ACCENTS.map((a) => {
                                    const active = a === theme.accent;
                                    return (
                                        <button
                                            key={a}
                                            type="button"
                                            aria-pressed={active}
                                            aria-label={t(`accents.${a}`)}
                                            title={t(`accents.${a}`)}
                                            onClick={() => theme.setAccent(a)}
                                            className={cn(
                                                "flex aspect-square min-h-9 items-center justify-center rounded-full ring-offset-2 ring-offset-surface transition-transform hover:scale-110",
                                                active ? "ring-2 ring-fg" : "ring-1 ring-line",
                                            )}
                                            style={{
                                                background: `oklch(0.7 0.18 ${ACCENT_HUE[a]})`,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        <fieldset>
                            <legend className="mb-2 font-mono text-[11px] tracking-[0.16em] text-fg-subtle uppercase">
                                {t("surface")}
                            </legend>
                            <Segmented<Surface>
                                label={t("surface")}
                                value={theme.surface}
                                options={SURFACES}
                                onChange={theme.setSurface}
                                render={(s) => <span>{t(s)}</span>}
                            />
                        </fieldset>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
