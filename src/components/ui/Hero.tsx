"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heading, Text } from "./Typography";
import Button from "./Button";
import Container from "./Container";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { ReactIcon, NextIcon, TypeScriptIcon, TailwindIcon, NodeIcon, PostgreSQLIcon, PythonIcon, TensorFlowIcon, AIIcon } from "@/components/icons";

const techStack = [
    { name: "React", icon: <ReactIcon className="w-4 h-4" /> },
    { name: "Next.js", icon: <NextIcon className="w-4 h-4" /> },
    { name: "TypeScript", icon: <TypeScriptIcon className="w-4 h-4" /> },
    { name: "Tailwind", icon: <TailwindIcon className="w-4 h-4" /> },
    { name: "Node.js", icon: <NodeIcon className="w-4 h-4" /> },
    { name: "PostgreSQL", icon: <PostgreSQLIcon className="w-4 h-4" /> },
    { name: "Python", icon: <PythonIcon className="w-4 h-4" /> },
    { name: "TensorFlow", icon: <TensorFlowIcon className="w-4 h-4" /> },
    { name: "AI/ML", icon: <AIIcon className="w-4 h-4" /> },
];

export default function Hero() {
    return (
        <section id="home" className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
                    backgroundSize: "60px 60px",
                }}
            />

            <Container className="relative z-10 py-20 px-6">
                <motion.div
                    className="flex flex-col items-center text-center max-w-4xl mx-auto"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Status badge */}
                    <motion.div
                        className="mb-10"
                        variants={staggerItem}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase border border-border bg-surface-raised/80 text-muted backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            Available for work
                        </span>
                    </motion.div>

                    {/* Main heading */}
                    <motion.div className="mb-6" variants={staggerItem}>
                        <Heading
                            as="h1"
                            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[0.95] tracking-tighter"
                        >
                            <span className="block text-foreground">I build things</span>
                            <span className="block gradient-text">for the web.</span>
                        </Heading>
                    </motion.div>

                    {/* Subtitle */}
                    <motion.div className="mb-10" variants={staggerItem}>
                        <Text
                            size="lg"
                            className="text-muted max-w-xl mx-auto text-base sm:text-lg leading-relaxed font-normal"
                        >
                            Full-stack developer crafting modern web applications with
                            clean code, thoughtful design, and AI-powered solutions.
                        </Text>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-3 mb-20"
                        variants={staggerItem}
                    >
                        <Button
                            variant="primary"
                            size="lg"
                            className="px-8 h-12 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 rounded-full"
                            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            View my work
                            <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                            </svg>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="px-8 h-12 text-sm font-medium border-border hover:bg-surface-raised rounded-full"
                            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Get in touch
                        </Button>
                    </motion.div>

                    {/* Tech Stack - minimal pill style */}
                    <motion.div
                        className="w-full max-w-2xl"
                        variants={staggerItem}
                    >
                        <Text size="xs" className="text-muted-foreground uppercase tracking-[0.2em] font-medium mb-4">
                            Technologies I work with
                        </Text>
                        <div className="flex flex-wrap justify-center gap-2">
                            {techStack.map((tech, index) => (
                                <motion.span
                                    key={tech.name}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-surface/80 text-muted hover:text-foreground hover:border-accent/30 hover:bg-accent/5 transition-all duration-200 cursor-default"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + index * 0.04, duration: 0.4 }}
                                    whileHover={{ y: -2, transition: { duration: 0.15 } }}
                                >
                                    {tech.icon}
                                    {tech.name}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </Container>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
            >
                <motion.button
                    className="flex flex-col items-center gap-2 text-muted-foreground hover:text-muted transition-colors"
                    onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    <motion.div
                        className="w-5 h-8 rounded-full border border-border-subtle flex items-start justify-center p-1.5"
                    >
                        <motion.div
                            className="w-1 h-1 bg-muted rounded-full"
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </motion.div>
                </motion.button>
            </motion.div>
        </section>
    );
}
