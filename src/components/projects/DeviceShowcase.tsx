"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Monitor, Moon, Smartphone, Sun, Tablet } from "lucide-react";
import type { ShotKey } from "@/lib/shots";
import { cn } from "@/lib/utils";

type Device = "desktop" | "tablet" | "mobile";
type Scheme = "dark" | "light";

const DEVICES: { key: Device; icon: typeof Monitor; w: number; h: number }[] = [
    { key: "desktop", icon: Monitor, w: 1440, h: 900 },
    { key: "tablet", icon: Tablet, w: 1024, h: 1366 },
    { key: "mobile", icon: Smartphone, w: 390, h: 844 },
];

export interface DeviceShowcaseProps {
    /** Map of shot key → public path (e.g. "/shots/codai/desktop-dark.jpg"). */
    files: Partial<Record<ShotKey, string>>;
    name: string;
    capturedAt?: string;
    /** Initial colour scheme; the page's own mode is a good default. */
    initialScheme?: Scheme;
}

/**
 * Screenshot gallery in CSS device frames. No animation beyond a fade on
 * image swap. Renders nothing when there is no desktop shot.
 */
export function DeviceShowcase({
    files,
    name,
    capturedAt,
    initialScheme = "dark",
}: DeviceShowcaseProps) {
    const t = useTranslations("projects.showcase");
    const id = useId();
    const [device, setDevice] = useState<Device>("desktop");
    const [scheme, setScheme] = useState<Scheme>(() =>
        files[`desktop-${initialScheme}`]
            ? initialScheme
            : initialScheme === "dark"
              ? "light"
              : "dark",
    );

    const available = DEVICES.filter((d) => files[`${d.key}-dark`] ?? files[`${d.key}-light`]);
    if (available.length === 0) return null;

    const current = available.find((d) => d.key === device) ?? available[0]!;
    const src =
        files[`${current.key}-${scheme}`] ??
        files[`${current.key}-${scheme === "dark" ? "light" : "dark"}`];
    const hasBothSchemes = Boolean(files[`${current.key}-dark`] && files[`${current.key}-light`]);

    return (
        <section aria-labelledby={`${id}-title`} className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight text-fg">
                    {t("title")}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                    <div
                        role="tablist"
                        aria-label={t("device")}
                        className="rounded-pill surface flex p-1 shadow-elev-1"
                    >
                        {available.map((d) => {
                            const Icon = d.icon;
                            const active = d.key === current.key;
                            return (
                                <button
                                    key={d.key}
                                    role="tab"
                                    type="button"
                                    aria-selected={active}
                                    aria-controls={`${id}-panel`}
                                    onClick={() => setDevice(d.key)}
                                    className={cn(
                                        "rounded-pill flex min-h-10 items-center gap-1.5 px-3 text-sm transition-colors",
                                        active
                                            ? "bg-accent text-accent-fg shadow-elev-1"
                                            : "text-fg-muted hover:text-fg",
                                    )}
                                >
                                    <Icon className="size-4" aria-hidden />
                                    <span className="hidden sm:inline">
                                        {t(`devices.${d.key}`)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    {hasBothSchemes ? (
                        <button
                            type="button"
                            aria-pressed={scheme === "light"}
                            aria-label={t(scheme === "dark" ? "showLight" : "showDark")}
                            onClick={() => setScheme((s) => (s === "dark" ? "light" : "dark"))}
                            className="rounded-pill surface flex min-h-10 min-w-10 items-center justify-center text-fg-muted shadow-elev-1 transition-colors hover:text-fg"
                        >
                            {scheme === "dark" ? (
                                <Sun className="size-4" aria-hidden />
                            ) : (
                                <Moon className="size-4" aria-hidden />
                            )}
                        </button>
                    ) : null}
                </div>
            </div>

            <div id={`${id}-panel`} role="tabpanel" className="flex justify-center">
                <figure
                    className={cn(
                        "device-frame relative overflow-hidden bg-bg-deep shadow-elev-3",
                        current.key === "desktop" && "device-desktop w-full",
                        current.key === "tablet" && "device-tablet w-full max-w-[26rem]",
                        current.key === "mobile" && "device-mobile w-full max-w-[16rem]",
                    )}
                    style={{ aspectRatio: `${current.w} / ${current.h}` }}
                >
                    {src ? (
                        <Image
                            key={src}
                            src={src}
                            alt={t("alt", {
                                name,
                                device: t(`devices.${current.key}`),
                                scheme: t(`schemes.${scheme}`),
                            })}
                            fill
                            sizes={
                                current.key === "desktop"
                                    ? "(min-width: 1024px) 66vw, 100vw"
                                    : "26rem"
                            }
                            className="object-cover object-top motion-safe:animate-[fade-in_0.3s_var(--ease-out-expo)]"
                        />
                    ) : null}
                    {capturedAt ? (
                        <figcaption className="sr-only">
                            {t("captured", { date: new Date(capturedAt).toLocaleDateString() })}
                        </figcaption>
                    ) : null}
                </figure>
            </div>
        </section>
    );
}
