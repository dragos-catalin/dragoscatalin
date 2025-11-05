"use client";

import React, { useState } from "react";
import Image from "next/image";
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

    const handleLinkClick = () => {
        setMobileMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/20 dark:border-gray-700/20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-lg">
            <nav className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <div className="flex items-center gap-4">
                    <a
                        href="#home"
                        className="flex items-center gap-3 group"
                        onClick={handleLinkClick}
                    >
                        <div className="relative">
                            <Image
                                src="/logo.png"
                                alt="Dragos Catalin Logo"
                                width={40}
                                height={40}
                                className="h-10 w-10 transition-transform group-hover:scale-110 group-hover:rotate-3"
                            />
                            <div className="absolute inset-0 bg-blue-500/20 dark:bg-gray-600/20 blur-md group-hover:blur-lg transition-all pointer-events-none" />
                        </div>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">Dragos Catalin</span>
                    </a>
                    <NotificationBadge />
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex md:gap-6 md:items-center">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="relative text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 group"
                        >
                            {link.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover:w-full transition-all duration-300" />
                        </a>
                    ))}

                    {/* Theme Switcher */}
                    <ThemeToggle />
                </div>

                {/* Mobile Menu Button */}
                <button
                    type="button"
                    className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-foreground hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-foreground"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-expanded={mobileMenuOpen}
                    aria-label="Toggle navigation menu"
                >
                    {mobileMenuOpen ? (
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    ) : (
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                            />
                        </svg>
                    )}
                </button>
            </nav>

            {/* Mobile Menu Dropdown */}
            <div
                className={cn(
                    "md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg",
                    mobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="space-y-1 px-4 py-4">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-foreground/10 transition-colors"
                            onClick={handleLinkClick}
                        >
                            {link.label}
                        </a>
                    ))}

                    {/* Mobile Theme Switcher */}
                    <ThemeToggle showLabel className="text-base font-medium" />
                </div>
            </div>
        </header>
    );
}
