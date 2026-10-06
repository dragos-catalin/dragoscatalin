"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Desktop with a precise pointer and no reduced-motion preference: the only place we pin. */
const PIN_QUERY =
    "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * Turns the server-rendered chapter list into a pinned horizontal track on desktop. The
 * markup is complete without JS (a vertical index); this only sets `data-pinned` (which
 * switches the CSS layout) and drives the track's x with the page scroll. Keyboard: links
 * stay in normal tab order, and focusing an off-screen chapter scrolls the page to the
 * position where that chapter is in view, so focus is never hidden or trapped.
 */
export function ChaptersPin({ children }: { children: ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = ref.current;
        if (!root) return;
        gsap.registerPlugin(ScrollTrigger);
        const mm = gsap.matchMedia();

        mm.add(PIN_QUERY, () => {
            const track = root.querySelector<HTMLElement>("[data-ed-track]");
            const progress = root.querySelector<HTMLElement>("[data-ed-progress]");
            if (!track) return;
            root.dataset.pinned = "on";

            const distance = () => Math.max(0, track.scrollWidth - root.clientWidth);
            const move = gsap.to(track, {
                x: () => -distance(),
                ease: "none",
                scrollTrigger: {
                    trigger: root,
                    start: "top top",
                    end: () => `+=${distance()}`,
                    pin: true,
                    scrub: true,
                    invalidateOnRefresh: true,
                    anticipatePin: 1,
                },
            });

            if (progress) {
                gsap.fromTo(
                    progress,
                    { scaleX: 0 },
                    {
                        scaleX: 1,
                        ease: "none",
                        scrollTrigger: {
                            trigger: track,
                            containerAnimation: move,
                            start: "left left",
                            end: "right right",
                            scrub: true,
                        },
                    },
                );
            }

            root.querySelectorAll<HTMLElement>("[data-ed-num]").forEach((num) => {
                gsap.fromTo(
                    num,
                    { xPercent: 30 },
                    {
                        xPercent: -30,
                        ease: "none",
                        scrollTrigger: {
                            trigger: num,
                            containerAnimation: move,
                            start: "left right",
                            end: "right left",
                            scrub: true,
                        },
                    },
                );
            });

            const onFocus = (event: FocusEvent) => {
                const st = move.scrollTrigger;
                const target = event.target;
                if (!st || !(target instanceof HTMLElement) || !track.contains(target)) return;
                const card = target.closest<HTMLElement>("[data-ed-chapter]") ?? target;
                const max = distance();
                if (max === 0) return;
                // Card position inside the track (both rects share the track's transform),
                // centred in the viewport and clamped to the scrub range.
                const cardBox = card.getBoundingClientRect();
                const offset = cardBox.left - track.getBoundingClientRect().left;
                const centred = offset - (root.clientWidth - cardBox.width) / 2;
                const wanted = Math.min(max, Math.max(0, centred));
                const top = st.start + (wanted / max) * (st.end - st.start);
                window.scrollTo({ top, behavior: "instant" });
                st.update();
            };
            root.addEventListener("focusin", onFocus);

            return () => {
                root.removeEventListener("focusin", onFocus);
                delete root.dataset.pinned;
            };
        });

        return () => mm.revert();
    }, []);

    return (
        <div ref={ref} className="ed-chapters">
            {children}
        </div>
    );
}
