"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full mx-4",
};

export default function Modal({ isOpen, onClose, children, className, size = "lg" }: ModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            className={cn(
                                "relative w-full bg-background rounded-2xl shadow-2xl border border-border",
                                sizeClasses[size],
                                className
                            )}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-surface-raised hover:bg-surface-raised/80 text-muted hover:text-foreground transition-all duration-200"
                                aria-label="Close modal"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Modal Content */}
                            {children}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

export function ModalHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("px-6 py-5 border-b border-border", className)}>
            {children}
        </div>
    );
}

export function ModalBody({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("px-6 py-6", className)}>
            {children}
        </div>
    );
}

export function ModalFooter({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("px-6 py-4 border-t border-border flex items-center justify-end gap-3", className)}>
            {children}
        </div>
    );
}
