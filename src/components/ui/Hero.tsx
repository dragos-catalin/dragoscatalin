"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heading, Text } from "./Typography";
import Button from "./Button";
import Container from "./Container";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { ReactIcon, NextIcon, TypeScriptIcon, TailwindIcon, NodeIcon, PostgreSQLIcon, PythonIcon, TensorFlowIcon, AIIcon } from "@/components/icons";

export default function Hero() {
    const [particles, setParticles] = useState<Array<{
        id: number;
        left: number;
        top: number;
        duration: number;
        delay: number;
        x: number;
    }>>([]);

    useEffect(() => {
        // Generate particles only on client side to avoid hydration mismatch
        const generatedParticles = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            duration: 5 + Math.random() * 5,
            delay: Math.random() * 5,
            x: Math.random() * 20 - 10,
        }));
        setParticles(generatedParticles);
    }, []);

    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Animated Blobs */}
            <motion.div
                className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-gray-300/30 dark:from-gray-700/40 dark:to-gray-800/40 rounded-full blur-3xl"
                animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-br from-gray-300/30 to-blue-300/30 dark:from-gray-800/40 dark:to-gray-700/40 rounded-full blur-3xl"
                animate={{
                    x: [0, -100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/30 to-gray-400/30 dark:from-gray-800/40 dark:to-gray-900/40 rounded-full blur-3xl"
                animate={{
                    x: [-50, 50, -50],
                    y: [0, -30, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute w-2 h-2 bg-gradient-to-br from-blue-500/20 to-gray-400/20 dark:from-gray-600/30 dark:to-gray-700/30 rounded-full"
                        style={{
                            left: `${particle.left}%`,
                            top: `${particle.top}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, particle.x, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            delay: particle.delay,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>

            <Container className="relative z-10 py-20 px-4">
                <motion.div
                    className="flex flex-col items-center text-center"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Badge */}
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span className="px-6 py-3 rounded-full bg-blue-500/10 dark:bg-blue-500/5 border border-blue-500/20 text-sm font-medium text-blue-600 dark:text-blue-400 shadow-lg">
                            ✨ Available for opportunities
                        </span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.div
                        className="mb-8"
                        variants={staggerItem}
                    >
                        <Heading as="h1" className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight mb-6">
                            <motion.span
                                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200"
                                animate={{
                                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                style={{
                                    backgroundSize: "200% 200%",
                                }}
                            >
                                Dragos Catalin
                            </motion.span>
                        </Heading>

                        <Heading as="h2" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-700 dark:text-gray-300 mb-6">
                            Full-Stack Developer & Creative Designer
                        </Heading>

                        <Text size="lg" variant="muted" className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl leading-relaxed">
                            Crafting beautiful, functional web experiences with modern technologies.
                            Transforming ideas into elegant solutions that make a difference.
                        </Text>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 mb-16"
                        variants={staggerItem}
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full sm:w-auto px-8 py-4 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20"
                                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                View Projects
                            </Button>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto px-8 py-4 text-base font-semibold border-2 hover:bg-blue-50 dark:hover:bg-gray-800"
                                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Contact Me
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Tech Stack */}
                    <motion.div
                        className="w-full max-w-4xl"
                        variants={staggerItem}
                    >
                        <Text size="sm" variant="muted" className="uppercase tracking-widest font-bold mb-6">
                            Tech Stack
                        </Text>
                        <div className="flex flex-wrap justify-center gap-3">
                            {[
                                {
                                    name: "React",
                                    color: "from-cyan-500 to-blue-500",
                                    icon: <ReactIcon className="w-4 h-4" />
                                },
                                {
                                    name: "Next.js",
                                    color: "from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800",
                                    icon: <NextIcon className="w-4 h-4" />
                                },
                                {
                                    name: "TypeScript",
                                    color: "from-blue-600 to-blue-700",
                                    icon: <TypeScriptIcon className="w-4 h-4" />
                                },
                                {
                                    name: "Tailwind CSS",
                                    color: "from-teal-500 to-cyan-600",
                                    icon: <TailwindIcon className="w-4 h-4" />
                                },
                                {
                                    name: "Node.js",
                                    color: "from-green-600 to-green-700",
                                    icon: <NodeIcon className="w-4 h-4" />
                                },
                                {
                                    name: "PostgreSQL",
                                    color: "from-blue-500 to-indigo-600",
                                    icon: <PostgreSQLIcon className="w-4 h-4" />
                                },
                                {
                                    name: "Python",
                                    color: "from-blue-600 to-yellow-500",
                                    icon: <PythonIcon className="w-4 h-4" />
                                },
                                {
                                    name: "TensorFlow",
                                    color: "from-orange-500 to-orange-600",
                                    icon: <TensorFlowIcon className="w-4 h-4" />
                                },
                                {
                                    name: "AI/ML",
                                    color: "from-purple-600 to-blue-500",
                                    icon: <AIIcon className="w-4 h-4" />
                                },
                            ].map((tech, index) => (
                                <motion.span
                                    key={tech.name}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${tech.color} text-white text-sm font-semibold shadow-md hover:shadow-lg cursor-pointer`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6 + index * 0.05 }}
                                    whileHover={{
                                        scale: 1.05,
                                        y: -2,
                                        transition: { duration: 0.2 }
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {tech.icon}
                                    {tech.name}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Scroll Indicator */}
                    <motion.div
                        className="mt-20"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                    >
                        <motion.button
                            className="flex flex-col items-center gap-2 cursor-pointer group"
                            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                            whileHover={{ scale: 1.1 }}
                        >
                            <Text size="xs" variant="muted" className="uppercase tracking-wider font-semibold">
                                Scroll to explore
                            </Text>
                            <motion.div
                                className="w-6 h-10 rounded-full border-2 border-gray-400 dark:border-gray-600 flex items-start justify-center p-2"
                                animate={{
                                    borderColor: ["rgba(156,163,175,0.5)", "rgba(156,163,175,1)", "rgba(156,163,175,0.5)"],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <motion.div
                                    className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full"
                                    animate={{ y: [0, 12, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </motion.div>
                        </motion.button>
                    </motion.div>
                </motion.div>
            </Container>
        </section>
    );
}
