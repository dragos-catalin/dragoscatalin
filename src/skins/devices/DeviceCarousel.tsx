"use client";

import {
    useEffect,
    useRef,
    useState,
    useSyncExternalStore,
    type CSSProperties,
    type MouseEvent,
    type PointerEvent,
    type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    AUTO_ADVANCE_MS,
    SLIDE_WIDTH_REM,
    dragSteps,
    exceedsSlop,
    ringRadius,
    ringRotation,
    slideAngle,
    wrapIndex,
} from "./carousel-math";

export interface DeviceCarouselLabels {
    carousel: string;
    previous: string;
    next: string;
    pause: string;
    play: string;
}

export interface DeviceCarouselSlide {
    key: string;
    /** "N of M: name", already localised on the server. */
    label: string;
    content: ReactNode;
}

/** 3D only from md up and when motion is welcome; everything else (and SSR) gets the 2D row. */
const QUERY_3D = "(min-width: 48rem) and (prefers-reduced-motion: no-preference)";

function subscribeMedia(onChange: () => void) {
    const mq = window.matchMedia(QUERY_3D);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
}
const get3D = () => window.matchMedia(QUERY_3D).matches;
const getServerFalse = () => false;

function subscribeVisibility(onChange: () => void) {
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
}
const getVisible = () => document.visibilityState === "visible";

interface Drag {
    pointerId: number;
    startX: number;
    moved: boolean;
}

const CONTROL =
    "inline-flex size-11 items-center justify-center rounded-pill border border-line bg-surface text-fg transition-[background-color,border-color] hover:border-line-strong hover:bg-surface-raised";

/**
 * Device-wall carousel (V3-07). The server HTML is a usable scroll-snap row; after mount, on
 * md+ without reduced motion, the same slides are laid on a CSS 3D ring (perspective + rotateY).
 * Rotation is user-driven (buttons, arrow keys, drag); a slow auto-advance runs only until the
 * first interaction, while in view and while the tab is visible, with a pause/play button.
 */
export function DeviceCarousel({
    slides,
    labels,
}: {
    slides: DeviceCarouselSlide[];
    labels: DeviceCarouselLabels;
}) {
    const n = slides.length;
    const is3D = useSyncExternalStore(subscribeMedia, get3D, getServerFalse);
    const tabVisible = useSyncExternalStore(subscribeVisibility, getVisible, getServerFalse);

    const [step, setStep] = useState(0);
    const [dragPx, setDragPx] = useState<number | null>(null);
    const [playing, setPlaying] = useState(true);
    const [held, setHeld] = useState(false);
    const [inView, setInView] = useState(false);

    const rootRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<Drag | null>(null);
    const swallowClick = useRef(false);

    const front = wrapIndex(step, n);
    const autoOn = is3D && playing && !held && inView && tabVisible && n > 1;

    useEffect(() => {
        const el = rootRef.current;
        if (!el || !is3D) return;
        const io = new IntersectionObserver(
            (entries) => setInView(entries.some((e) => e.isIntersecting)),
            { threshold: 0.4 },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [is3D]);

    useEffect(() => {
        if (!autoOn) return;
        const id = window.setInterval(() => setStep((s) => s + 1), AUTO_ADVANCE_MS);
        return () => window.clearInterval(id);
    }, [autoOn]);

    // Region-level listeners (arrow keys while focus is inside, hover/focus holds auto-advance)
    // are native: the region is a landmark, not a widget, so it gets no JSX handlers or tab stop.
    useEffect(() => {
        const el = rootRef.current;
        if (!el || !is3D) return;
        const onKey = (e: globalThis.KeyboardEvent) => {
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
            e.preventDefault();
            setPlaying(false);
            setStep((s) => s + (e.key === "ArrowLeft" ? -1 : 1));
        };
        const hold = () => setHeld(true);
        const release = () => setHeld(false);
        const onFocusOut = (e: FocusEvent) => {
            if (!(e.relatedTarget instanceof Node) || !el.contains(e.relatedTarget)) release();
        };
        el.addEventListener("keydown", onKey);
        el.addEventListener("pointerenter", hold);
        el.addEventListener("pointerleave", release);
        el.addEventListener("focusin", hold);
        el.addEventListener("focusout", onFocusOut);
        return () => {
            el.removeEventListener("keydown", onKey);
            el.removeEventListener("pointerenter", hold);
            el.removeEventListener("pointerleave", release);
            el.removeEventListener("focusin", hold);
            el.removeEventListener("focusout", onFocusOut);
        };
    }, [is3D]);

    function go(delta: number) {
        if (delta === 0) return;
        setPlaying(false); // any manual move ends auto-advance (until Play)
        setStep((s) => s + delta);
    }

    function onPointerDown(e: PointerEvent<HTMLDivElement>) {
        if (!is3D || (e.pointerType === "mouse" && e.button !== 0)) return;
        swallowClick.current = false;
        dragRef.current = { pointerId: e.pointerId, startX: e.clientX, moved: false };
    }

    function onPointerMove(e: PointerEvent<HTMLDivElement>) {
        const d = dragRef.current;
        if (!d || d.pointerId !== e.pointerId) return;
        const dx = e.clientX - d.startX;
        if (!d.moved && !exceedsSlop(dx)) return;
        if (!d.moved) {
            d.moved = true;
            e.currentTarget.setPointerCapture(e.pointerId);
        }
        setDragPx(dx);
    }

    function endDrag(e: PointerEvent<HTMLDivElement>, cancelled: boolean) {
        const d = dragRef.current;
        if (!d || d.pointerId !== e.pointerId) return;
        dragRef.current = null;
        if (!d.moved) return;
        swallowClick.current = true; // the click that ends a drag must not follow a link
        setDragPx(null);
        if (!cancelled) go(dragSteps(e.clientX - d.startX));
    }

    function onClickCapture(e: MouseEvent<HTMLDivElement>) {
        if (!swallowClick.current) return;
        swallowClick.current = false;
        e.preventDefault();
        e.stopPropagation();
    }

    const radius = ringRadius(n);
    const ringStyle: CSSProperties | undefined = is3D
        ? {
              transform: `translateZ(-${radius}rem) rotateY(${ringRotation(step, n, dragPx ?? 0)}deg)`,
          }
        : undefined;

    return (
        <div
            ref={rootRef}
            role="region"
            aria-roledescription="carousel"
            aria-label={labels.carousel}
            className="dv-carousel"
            style={{ "--dv-slide-w": `${SLIDE_WIDTH_REM}rem` } as CSSProperties}
        >
            <div
                className={is3D ? "dv-stage" : undefined}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={(e) => endDrag(e, false)}
                onPointerCancel={(e) => endDrag(e, true)}
                onClickCapture={onClickCapture}
            >
                {/* Slides carry role="group" (APG carousel), which a <li> may not have inside a
                    <ul> (axe "list"), so the track is plain divs. */}
                <div
                    className={is3D ? "dv-ring" : "dv-row"}
                    data-dragging={dragPx !== null ? "" : undefined}
                    aria-live={is3D && !autoOn ? "polite" : "off"}
                    style={ringStyle}
                >
                    {slides.map((s, i) => {
                        const isFront = i === front;
                        return (
                            <div
                                key={s.key}
                                role="group"
                                aria-roledescription="slide"
                                aria-label={s.label}
                                data-front={is3D && isFront ? "" : undefined}
                                inert={is3D && !isFront}
                                className="dv-slide"
                                style={
                                    is3D
                                        ? {
                                              transform: `rotateY(${slideAngle(i, n)}deg) translateZ(${radius}rem)`,
                                          }
                                        : undefined
                                }
                            >
                                {s.content}
                            </div>
                        );
                    })}
                </div>
            </div>

            {is3D && n > 1 ? (
                <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                        type="button"
                        className={CONTROL}
                        aria-label={labels.previous}
                        onClick={() => go(-1)}
                    >
                        <ChevronLeft aria-hidden="true" className="size-5" />
                    </button>
                    <button
                        type="button"
                        className={cn(CONTROL, "text-fg-muted")}
                        aria-label={playing ? labels.pause : labels.play}
                        onClick={() => setPlaying((p) => !p)}
                    >
                        {playing ? (
                            <Pause aria-hidden="true" className="size-4" />
                        ) : (
                            <Play aria-hidden="true" className="size-4" />
                        )}
                    </button>
                    <button
                        type="button"
                        className={CONTROL}
                        aria-label={labels.next}
                        onClick={() => go(1)}
                    >
                        <ChevronRight aria-hidden="true" className="size-5" />
                    </button>
                </div>
            ) : null}
        </div>
    );
}
