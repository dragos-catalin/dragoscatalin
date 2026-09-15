"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { fade, fadeUp, stagger } from "@/lib/motion";

/**
 * Choreography per docs/DESIGN.md: headline words rise at 600 ms (stagger 40 ms),
 * subtitle/CTAs/status follow at ~900 ms, settle by 1.4 s. Reduced motion → opacity only.
 */
export function HeroReveal({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const reduced = useReducedMotion();
    const parent: Variants = reduced ? stagger(0, 0) : stagger(0.12, 0.6);
    return (
        <motion.div className={className} variants={parent} initial="hidden" animate="visible">
            {children}
        </motion.div>
    );
}

export function HeroItem({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const reduced = useReducedMotion();
    return (
        <motion.div className={className} variants={reduced ? fade : fadeUp}>
            {children}
        </motion.div>
    );
}

/** Splits a headline into words that rise with a 40 ms stagger. */
export function HeroWords({ text, className }: { text: string; className?: string }) {
    const reduced = useReducedMotion();
    const words = text.split(" ");
    const wordVariants: Variants = reduced
        ? fade
        : {
              hidden: { opacity: 0, y: "0.6em" },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
          };
    return (
        <motion.span className={className} variants={stagger(reduced ? 0 : 0.04)}>
            <span className="sr-only">{text}</span>
            {words.map((w, i) => (
                <span
                    key={`${w}-${i}`}
                    className="inline-block overflow-hidden pb-[0.08em] align-baseline"
                    aria-hidden="true"
                >
                    <motion.span className="inline-block" variants={wordVariants}>
                        {w}
                        {i < words.length - 1 ? "\u00a0" : ""}
                    </motion.span>
                </span>
            ))}
        </motion.span>
    );
}
