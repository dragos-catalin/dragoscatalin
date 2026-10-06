"use client";

import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
    type CommandLabels,
    type Effect,
    type OutLine,
    type TermProject,
    type Tone,
    complete,
    runCommand,
} from "./commands";
import { useMounted } from "./useMounted";

export interface TerminalLabels extends CommandLabels {
    inputLabel: string;
    placeholder: string;
    shortcut: string;
}

interface Entry {
    id: number;
    input?: string;
    lines: OutLine[];
}

const TONE: Record<Tone, string> = {
    default: "text-fg",
    muted: "text-fg-muted",
    accent: "text-accent",
    error: "text-danger",
};

/** True when keystrokes belong to another field (contact form, search, contenteditable). */
function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable) return true;
    const tag = target.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/**
 * Interactive prompt for the command skin (V3-06). Progressive enhancement: the server already
 * rendered `whoami` and the `ps` table; this island renders a disabled input in SSR and enables
 * it after hydration (useMounted, no setState in an effect).
 */
export function Terminal({
    labels,
    projects,
    skins,
    homePath,
    user,
}: {
    labels: TerminalLabels;
    projects: readonly TermProject[];
    skins: readonly string[];
    homePath: string;
    user: string;
}) {
    const mounted = useMounted();
    const router = useRouter();
    const inputId = useId();
    const hintId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const logRef = useRef<HTMLDivElement>(null);
    const nextId = useRef(0);
    const [value, setValue] = useState("");
    const [entries, setEntries] = useState<Entry[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [cursor, setCursor] = useState<number | null>(null);

    useEffect(() => {
        const onKey = (e: globalThis.KeyboardEvent) => {
            if (e.defaultPrevented || isTypingTarget(e.target)) return;
            const slash = e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey;
            const palette = e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey) && !e.altKey;
            if (!slash && !palette) return;
            e.preventDefault();
            inputRef.current?.focus();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        const log = logRef.current;
        if (log) log.scrollTop = log.scrollHeight;
    }, [entries]);

    const push = (entry: Omit<Entry, "id">) => {
        nextId.current += 1;
        const id = nextId.current;
        setEntries((prev) => [...prev, { ...entry, id }]);
    };

    const apply = (effect: Effect) => {
        switch (effect.kind) {
            case "clear":
                setEntries([]);
                return;
            case "navigate":
                router.push(effect.href);
                return;
            case "scroll":
                document.getElementById(effect.id)?.scrollIntoView({ block: "start" });
                return;
            case "reload":
                window.location.assign(effect.href);
                return;
        }
    };

    const submit = () => {
        const input = value.trim();
        setValue("");
        setCursor(null);
        if (!input) return;
        const result = runCommand(input, { labels, projects, skins, history, homePath });
        setHistory((prev) => [...prev, input]);
        if (result.effect?.kind !== "clear") push({ input, lines: result.lines });
        if (result.effect) apply(result.effect);
    };

    const browse = (dir: -1 | 1) => {
        if (history.length === 0) return;
        const from = cursor ?? history.length;
        const to = Math.min(Math.max(from + dir, 0), history.length);
        setCursor(to === history.length ? null : to);
        setValue(history[to] ?? "");
    };

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            submit();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            browse(-1);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            browse(1);
        } else if (e.key === "Tab" && !e.shiftKey && value.trim() !== "") {
            // Empty prompt: Tab keeps moving focus, so the field is never a keyboard trap.
            e.preventDefault();
            const done = complete(value, { projects, skins });
            setValue(done.value);
            if (done.options.length > 0) {
                push({ input: value, lines: [{ text: done.options.join("  "), tone: "muted" }] });
            }
        } else if (e.key.toLowerCase() === "l" && e.ctrlKey) {
            e.preventDefault();
            setEntries([]);
        } else if (e.key === "Escape") {
            e.currentTarget.blur();
        }
    };

    return (
        <div className="cmd-term flex flex-col gap-2 text-sm">
            <div
                ref={logRef}
                role="log"
                aria-live="polite"
                aria-relevant="additions"
                className="cmd-log flex flex-col gap-2 overflow-y-auto"
            >
                {entries.map((entry) => (
                    <div key={entry.id}>
                        {entry.input !== undefined && (
                            <p className="text-fg-muted">
                                <span className="text-accent">{user}</span> ${" "}
                                <span className="text-fg">{entry.input}</span>
                            </p>
                        )}
                        {entry.lines.map((line, i) => (
                            <pre
                                key={i}
                                className={cn(
                                    "font-mono break-words whitespace-pre-wrap",
                                    TONE[line.tone ?? "default"],
                                )}
                            >
                                {line.text}
                            </pre>
                        ))}
                    </div>
                ))}
            </div>
            <div className="cmd-prompt flex items-center gap-2">
                <label htmlFor={inputId} className="sr-only">
                    {labels.inputLabel}
                </label>
                <span aria-hidden="true" className="shrink-0 text-fg-muted">
                    <span className="text-accent">{user}</span> $
                </span>
                <input
                    ref={inputRef}
                    id={inputId}
                    type="text"
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        setCursor(null);
                    }}
                    onKeyDown={onKeyDown}
                    disabled={!mounted}
                    placeholder={labels.placeholder}
                    aria-describedby={hintId}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="send"
                    className="cmd-input min-h-11 min-w-0 flex-1 bg-transparent font-mono text-fg placeholder:text-fg-subtle"
                />
            </div>
            <p id={hintId} className="text-xs text-fg-muted">
                <kbd className="cmd-kbd">/</kbd> · <kbd className="cmd-kbd">Ctrl</kbd>+
                <kbd className="cmd-kbd">K</kbd> — {labels.shortcut}
            </p>
        </div>
    );
}
