// Common animation variants for Framer Motion

export const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
};

export const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" as const },
    },
};

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
};

export const slideInLeft = {
    hidden: { opacity: 0, x: -24 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
};

export const slideInRight = {
    hidden: { opacity: 0, x: 24 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

export const staggerItem = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
};

// Animation configurations
export const defaultTransition = {
    duration: 0.5,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export const springTransition = {
    type: "spring" as const,
    stiffness: 120,
    damping: 20,
};

export const viewportConfig = {
    once: true,
    amount: 0.2,
};
