"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type CopyState = "idle" | "copied" | "failed";

export function CopyButton({
    text,
    label,
    className,
}: {
    text: string;
    label: string;
    className?: string;
}) {
    const t = useTranslations("press");
    const [state, setState] = useState<CopyState>("idle");

    useEffect(() => {
        if (state === "idle") return;
        const id = window.setTimeout(() => setState("idle"), 2000);
        return () => window.clearTimeout(id);
    }, [state]);

    async function copy() {
        try {
            await navigator.clipboard.writeText(text);
            setState("copied");
        } catch {
            setState("failed");
        }
    }

    const status = state === "copied" ? t("copied") : state === "failed" ? t("copyFailed") : "";

    return (
        <span className={cn("inline-flex items-center gap-2", className)}>
            <button
                type="button"
                onClick={copy}
                aria-label={`${t("copy")}: ${label}`}
                className="inline-flex h-9 items-center gap-2 rounded-pill border border-line bg-surface px-3 text-sm font-medium text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
            >
                {state === "copied" ? (
                    <Check className="size-4 text-success" aria-hidden />
                ) : (
                    <Copy className="size-4" aria-hidden />
                )}
                {state === "copied" ? t("copied") : t("copy")}
            </button>
            <span role="status" aria-live="polite" className="sr-only">
                {status}
            </span>
        </span>
    );
}
