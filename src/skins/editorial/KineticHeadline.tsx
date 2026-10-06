"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

type Props = {
    id: string;
    line1: string;
    line2: string;
};

/**
 * Editorial cover headline. The server HTML is the finished, readable h1 (LCP paints in the
 * first frame). After hydration, and only without prefers-reduced-motion, SplitText cuts each
 * line into word masks + chars and the chars rise out of their masks. The h1 keeps the whole
 * sentence as its accessible name; the split lines are aria-hidden so screen readers never
 * spell letters. Everything is reverted on unmount or when the media query flips.
 */
export function KineticHeadline({ id, line1, line2 }: Props) {
    const ref = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const h1 = ref.current;
        if (!h1) return;
        gsap.registerPlugin(SplitText);
        const mm = gsap.matchMedia();

        mm.add("(prefers-reduced-motion: no-preference)", () => {
            const lines = Array.from(h1.querySelectorAll<HTMLElement>(".ed-line"));
            h1.dataset.kinetic = "on";
            const splits = lines.map((line) =>
                SplitText.create(line, {
                    type: "words,chars",
                    mask: "words",
                    wordsClass: "ed-word",
                    charsClass: "ed-char",
                    aria: "hidden",
                }),
            );

            const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
            splits.forEach((split, i) => {
                tl.from(
                    split.chars,
                    {
                        yPercent: 115,
                        rotate: 6,
                        duration: 1.1,
                        stagger: { each: 0.022, from: "start" },
                    },
                    i * 0.28,
                );
            });

            return () => {
                tl.kill();
                splits.forEach((split) => split.revert());
                delete h1.dataset.kinetic;
            };
        });

        return () => mm.revert();
    }, []);

    return (
        <h1
            ref={ref}
            id={id}
            aria-label={`${line1} ${line2}`}
            className="ed-headline font-display font-extrabold text-fg"
        >
            <span className="ed-line" style={{ "--i": 0 } as React.CSSProperties}>
                {line1}
            </span>{" "}
            <span className="ed-line text-accent" style={{ "--i": 1 } as React.CSSProperties}>
                {line2}
            </span>
        </h1>
    );
}
