"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES, STATUSES, useProjectFilters } from "./useProjectFilters";

export interface ProjectFiltersProps {
    stackOptions: string[];
    count: number;
}

function toggle<T extends string>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Chip({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            aria-pressed={active}
            onClick={onClick}
            className={cn(
                "rounded-pill border px-3 py-1 text-xs font-medium transition-colors",
                active
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg",
            )}
        >
            {children}
        </button>
    );
}

export function ProjectFilters({ stackOptions, count }: ProjectFiltersProps) {
    const t = useTranslations("projects");
    const { filters, setFilters, isActive } = useProjectFilters();
    // Local input state, re-synced when the URL value changes (e.g. "clear" or back/forward).
    const [local, setLocal] = useState({ synced: filters.q, value: filters.q });
    const query = local.synced === filters.q ? local.value : filters.q;
    if (local.synced !== filters.q) setLocal({ synced: filters.q, value: filters.q });
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timer.current) clearTimeout(timer.current);
        },
        [],
    );

    function onSearch(value: string) {
        setLocal({ synced: filters.q, value });
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            startTransition(() => {
                void setFilters({ q: value });
            });
        }, 200);
    }

    function clear() {
        setLocal({ synced: "", value: "" });
        startTransition(() => {
            void setFilters({ q: "", status: [], category: [], stack: [] });
        });
    }

    return (
        <div className="flex flex-col gap-4" role="search">
            <div className="flex flex-wrap items-center gap-3">
                <label className="relative flex-1 min-w-[16rem]">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle"
                        aria-hidden
                    />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => onSearch(e.target.value)}
                        aria-label={t("filters.search")}
                        placeholder={t("filters.search")}
                        className="w-full rounded-pill border border-line bg-surface py-2 pl-9 pr-3 text-sm text-fg placeholder:text-fg-subtle focus-visible:border-accent"
                    />
                </label>
                <p className="font-mono text-xs text-fg-subtle" aria-live="polite">
                    {t("filters.results", { count })}
                </p>
                {isActive ? (
                    <button
                        type="button"
                        onClick={clear}
                        className="flex items-center gap-1 rounded-pill border border-line px-3 py-1 text-xs text-fg-muted hover:text-fg"
                    >
                        <X className="size-3.5" aria-hidden />
                        {t("filters.clear")}
                    </button>
                ) : null}
            </div>

            <fieldset className="flex flex-wrap items-center gap-2">
                <legend className="sr-only">{t("filters.status")}</legend>
                <span
                    className="mr-1 font-mono text-[11px] uppercase tracking-wider text-fg-subtle"
                    aria-hidden
                >
                    {t("filters.status")}
                </span>
                {STATUSES.map((s) => (
                    <Chip
                        key={s}
                        active={filters.status.includes(s)}
                        onClick={() => void setFilters({ status: toggle(filters.status, s) })}
                    >
                        {t(`status.${s}`)}
                    </Chip>
                ))}
            </fieldset>

            <fieldset className="flex flex-wrap items-center gap-2">
                <legend className="sr-only">{t("filters.category")}</legend>
                <span
                    className="mr-1 font-mono text-[11px] uppercase tracking-wider text-fg-subtle"
                    aria-hidden
                >
                    {t("filters.category")}
                </span>
                {CATEGORIES.map((c) => (
                    <Chip
                        key={c}
                        active={filters.category.includes(c)}
                        onClick={() => void setFilters({ category: toggle(filters.category, c) })}
                    >
                        {t(`category.${c}`)}
                    </Chip>
                ))}
            </fieldset>

            {stackOptions.length > 0 ? (
                <fieldset className="flex flex-wrap items-center gap-2">
                    <legend className="sr-only">{t("filters.stack")}</legend>
                    <span
                        className="mr-1 font-mono text-[11px] uppercase tracking-wider text-fg-subtle"
                        aria-hidden
                    >
                        {t("filters.stack")}
                    </span>
                    {stackOptions.map((s) => (
                        <Chip
                            key={s}
                            active={filters.stack.includes(s)}
                            onClick={() => void setFilters({ stack: toggle(filters.stack, s) })}
                        >
                            {s}
                        </Chip>
                    ))}
                </fieldset>
            ) : null}
        </div>
    );
}
