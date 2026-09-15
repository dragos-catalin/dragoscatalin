import type { Transition, Variants } from "motion/react";

export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export const baseTransition: Transition = { duration: 0.6, ease: easeOutExpo };
export const springTransition: Transition = { type: "spring", stiffness: 260, damping: 26 };

export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: baseTransition },
};

export const fade: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1, transition: baseTransition },
};

/** Parent: stagger children with `delayChildren`. */
export const stagger = (step = 0.06, delay = 0): Variants => ({
    hidden: {},
    visible: { transition: { delayChildren: delay, staggerChildren: step } },
});

export const viewportOnce = { once: true, amount: 0.2 } as const;
