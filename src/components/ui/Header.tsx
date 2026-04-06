"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import NotificationBadge from "./NotificationBadge";

const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#projects", label: "Projects" },
    { href: "#contact", label: "Contact" },
];

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLinkClick = () => {
        setMobileMenuOpen(false);
    };

    return (
        <motion.header
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-500",
                scrolled
                    ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
                    : "bg-transparent"
            )}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <a
                        href="#home"
                        className="flex items-center gap-3 group"
                        onClick={handleLinkClick}
                    >
                        <div className="relative">
                            <Image
                                src="/logo.png"
                                alt="Dragos Catalin Logo"
                                width={36}
                                height={36}
                                className="h-9 w-9 transition-all duration-300 group-hover:scale-110"
                            />
                        </div>
                        <span className="text-lg font-semibold tracking-tight text-foreground">
                            Dragos<span className="text-accent">.</span>
                        </span>
                    </a>
                    <NotificationBadge />
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex md:items-center md:gap-1">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="relative px-4 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors duration-200 group"
                        >
                            {link.label}
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-accent group-hover:w-1/2 transition-all duration-300" />
                        </a>
                    ))}
                    <div className="ml-2 h-5 w-px bg-border" />
                    <ThemeToggle />
                </div>

                {/* Mobile Menu Button */}
                <button
                    type="button"
                    className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg text-foreground hover:bg-surface-raised transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-expanded={mobileMenuOpen}
                    aria-label="Toggle navigation menu"
                >
                    <div className="relative w-5 h-4 flex flex-col justify-between">
                        <span className={cn(
                            "block h-px w-full bg-current transition-all duration-300 origin-center",
                            mobileMenuOpen && "rotate-45 translate-y-[7.5px]"
                        )} />
                        <span className={cn(
                            "block h-px w-full bg-current transition-all duration-300",
                            mobileMenuOpen && "opacity-0 scale-0"
                        )} />
                        <span className={cn(
                            "block h-px w-full bg-current transition-all duration-300 origin-center",
                            mobileMenuOpen && "-rotate-45 -translate-y-[7.5px]"
                        )} />
                    </div>
                </button>
            </nav>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="space-y-1 px-6 py-4">
                            {navLinks.map((link, i) => (
                                <motion.a
                                    key={link.href}
                                    href={link.href}
                                    className="block rounded-lg px-3 py-2.5 text-base font-medium text-muted hover:text-foreground hover:bg-surface-raised transition-colors"
                                    onClick={handleLinkClick}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    {link.label}
                                </motion.a>
                            ))}
                            <div className="pt-2 border-t border-border/50">
                                <ThemeToggle showLabel className="text-base font-medium" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
