"use client";

import React from "react";
import { motion } from "framer-motion";
import { Text } from "./Typography";
import Container from "./Container";
import { fadeInUp, viewportConfig } from "@/lib/animations";
import { GitHubIcon, InstagramIcon, TikTokIcon, DiscordIcon } from "@/components/icons";
import { socialLinks } from "@/lib/socials";

const footerLinks = [
    { label: "Home", href: "#home" },
    { label: "Projects", href: "#projects" },
    { label: "Contact", href: "#contact" },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative border-t border-border overflow-hidden">
            <Container className="py-16 relative z-10">
                <motion.div
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportConfig}
                    variants={fadeInUp}
                >
                    {/* Brand */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold tracking-tight text-foreground">
                            Dragos<span className="text-accent">.</span>
                        </h3>
                        <Text size="sm" className="text-muted max-w-xs">
                            Building beautiful and functional web experiences.
                        </Text>
                    </div>

                    {/* Navigation */}
                    <nav className="flex items-center gap-6">
                        {footerLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-sm text-muted hover:text-foreground transition-colors duration-200"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Social Links */}
                    <div className="flex items-center gap-2">
                        {socialLinks.map((social) => (
                            <a
                                key={social.name}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-raised transition-all duration-200"
                                aria-label={social.name}
                            >
                                {social.icon === "github" && <GitHubIcon className="w-4 h-4" />}
                                {social.icon === "instagram" && <InstagramIcon className="w-4 h-4" />}
                                {social.icon === "tiktok" && <TikTokIcon className="w-4 h-4" />}
                                {social.icon === "discord" && <DiscordIcon className="w-4 h-4" />}
                            </a>
                        ))}
                    </div>
                </motion.div>

                {/* Bottom */}
                <div className="mt-10 pt-6 border-t border-border">
                    <Text size="xs" className="text-muted-foreground text-center">
                        &copy; {currentYear} Dragos Catalin. All rights reserved.
                    </Text>
                </div>
            </Container>
        </footer>
    );
}
