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
        <footer className="relative border-t border-white/20 dark:border-gray-700/20 overflow-hidden">
            {/* Gradient accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-500" />

            <Container className="py-12 relative z-10">
                <motion.div
                    className="grid grid-cols-1 gap-8 md:grid-cols-3"
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportConfig}
                    variants={fadeInUp}
                >
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-black text-blue-600 dark:text-blue-400">Dragos Catalin</h3>
                        <Text size="sm" variant="muted" className="leading-relaxed">
                            Building beautiful and functional web experiences with modern technologies.
                        </Text>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-foreground">Quick Links</h3>
                        <nav className="flex flex-col space-y-2">
                            {footerLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm text-gray-600 hover:text-foreground dark:text-gray-400 dark:hover:text-foreground transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-foreground">Connect</h3>
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full bg-blue-500/10 hover:bg-blue-500/20 dark:bg-gray-700/50 dark:hover:bg-gray-600/50 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    aria-label={social.name}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {social.icon === "github" && <GitHubIcon />}
                                    {social.icon === "instagram" && <InstagramIcon />}
                                    {social.icon === "tiktok" && <TikTokIcon />}
                                    {social.icon === "discord" && <DiscordIcon />}
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Bottom Bar */}
                <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
                    <Text size="sm" variant="muted" className="text-center">
                        © {currentYear} Dragos Catalin. All rights reserved.
                    </Text>
                </div>
            </Container>
        </footer>
    );
}
