"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { ThemeMenu } from "@/components/theme/ThemeMenu";
import { LocaleSwitcher } from "@/components/theme/LocaleSwitcher";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV = [
    { key: "home", href: "/" },
    { key: "projects", href: "/projects" },
    { key: "openSource", href: "/open-source" },
    { key: "about", href: "/about" },
    { key: "now", href: "/now" },
] as const;

function isActive(pathname: string, href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
    const t = useTranslations("nav");
    const pathname = usePathname();
    const [compact, setCompact] = useState(false);
    const [open, setOpen] = useState(false);
    const sheetId = useId();
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Compact after 20px of scroll.
    useEffect(() => {
        const onScroll = () => setCompact(window.scrollY > 20);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Escape, body scroll lock, focus return.
    useEffect(() => {
        if (!open) return;
        const button = buttonRef.current;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener("keydown", onKey);
            button?.focus();
        };
    }, [open]);

    return (
        <header
            className={cn(
                "surface sticky top-0 z-50 border-x-0 border-t-0 pt-[env(safe-area-inset-top)] transition-[padding,box-shadow] duration-300 ease-out-expo",
                compact ? "shadow-card" : "border-b-transparent",
            )}
        >
            <div
                className={cn(
                    "container-x flex items-center justify-between gap-4 transition-[height] duration-300 ease-out-expo",
                    compact ? "h-14" : "h-[4.5rem]",
                )}
            >
                <Link
                    href="/"
                    className="flex items-center gap-2.5 rounded-pill"
                    aria-label={site.name}
                >
                    <Image
                        src="/logo.png"
                        alt=""
                        width={32}
                        height={32}
                        className="size-8 rounded-lg"
                        priority
                    />
                    <span className="text-lg font-bold tracking-tight text-fg">
                        Dragos<span className="text-accent">.</span>
                    </span>
                </Link>

                <nav aria-label={t("menu")} className="hidden md:block">
                    <ul className="flex items-center gap-1">
                        {NAV.map((item) => {
                            const active = isActive(pathname, item.href);
                            return (
                                <li key={item.key}>
                                    <Link
                                        href={item.href}
                                        aria-current={active ? "page" : undefined}
                                        className={cn(
                                            "relative inline-flex min-h-11 items-center rounded-pill px-3.5 text-sm font-medium transition-colors",
                                            active ? "text-fg" : "text-fg-muted hover:text-fg",
                                        )}
                                    >
                                        {t(item.key)}
                                        {active ? (
                                            <span
                                                aria-hidden
                                                className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-accent"
                                            />
                                        ) : null}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="flex items-center gap-1">
                    <ThemeMenu />
                    <LocaleSwitcher />
                    <button
                        ref={buttonRef}
                        type="button"
                        aria-expanded={open}
                        aria-controls={sheetId}
                        aria-label={open ? t("closeMenu") : t("menu")}
                        onClick={() => setOpen((v) => !v)}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill text-fg-muted transition-colors hover:bg-accent-soft hover:text-fg md:hidden"
                    >
                        {open ? (
                            <X className="size-5" aria-hidden />
                        ) : (
                            <Menu className="size-5" aria-hidden />
                        )}
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {open ? (
                    <motion.div
                        key="mobile-sheet"
                        id={sheetId}
                        role="dialog"
                        aria-modal="true"
                        aria-label={t("menu")}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 top-[calc(3.5rem+env(safe-area-inset-top))] z-40 flex flex-col bg-bg md:hidden"
                    >
                        <nav
                            aria-label={t("menu")}
                            className="container-x flex flex-1 flex-col py-6"
                        >
                            <ul className="flex flex-col gap-1">
                                {NAV.map((item, i) => {
                                    const active = isActive(pathname, item.href);
                                    return (
                                        <motion.li
                                            key={item.key}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: 0.04 * i,
                                                duration: 0.3,
                                                ease: [0.16, 1, 0.3, 1],
                                            }}
                                        >
                                            <Link
                                                href={item.href}
                                                aria-current={active ? "page" : undefined}
                                                onClick={() => setOpen(false)}
                                                className={cn(
                                                    "flex min-h-14 items-center rounded-card px-4 text-2xl font-bold tracking-tight transition-colors",
                                                    active
                                                        ? "bg-accent-soft text-accent"
                                                        : "text-fg hover:bg-surface-raised",
                                                )}
                                            >
                                                {t(item.key)}
                                            </Link>
                                        </motion.li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </header>
    );
}
