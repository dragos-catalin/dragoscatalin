"use client";

import React from "react";
import { motion } from "framer-motion";
import Modal, { ModalHeader, ModalBody, ModalFooter } from "./Modal";
import { Heading, Text } from "./Typography";
import Badge from "./Badge";
import Button from "./Button";
import WebsitePreview from "./WebsitePreview";

interface Project {
    id: string;
    title: string;
    description: string;
    technologies: string[];
    image?: string;
    demoUrl?: string;
    githubUrl?: string;
    fullDescription?: string;
    features?: string[];
    challenges?: string;
    results?: string;
}

interface ProjectModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
    if (!project) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalHeader>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground">
                        {project.id.padStart(2, "0")}
                    </span>
                    <Heading as="h2" className="text-2xl font-bold tracking-tight text-foreground pr-8">
                        {project.title}
                    </Heading>
                </div>
            </ModalHeader>

            <ModalBody className="space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Website Preview */}
                {project.demoUrl && (
                    <motion.div
                        className="w-full rounded-xl overflow-hidden border border-border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <WebsitePreview
                            url={project.demoUrl}
                            alt={project.title}
                            className="w-full h-64 sm:h-80"
                        />
                    </motion.div>
                )}

                {/* Technologies */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Text size="xs" className="mb-3 font-medium uppercase tracking-[0.15em] text-muted-foreground">
                        Technologies
                    </Text>
                    <div className="flex flex-wrap gap-1.5">
                        {project.technologies.map((tech) => (
                            <Badge key={tech} variant="info" size="md">
                                {tech}
                            </Badge>
                        ))}
                    </div>
                </motion.div>

                {/* Description */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Text size="xs" className="mb-3 font-medium uppercase tracking-[0.15em] text-muted-foreground">
                        Overview
                    </Text>
                    <Text size="sm" className="leading-relaxed text-foreground">
                        {project.fullDescription || project.description}
                    </Text>
                </motion.div>

                {/* Features */}
                {project.features && project.features.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Text size="xs" className="mb-3 font-medium uppercase tracking-[0.15em] text-muted-foreground">
                            Key Features
                        </Text>
                        <ul className="space-y-2">
                            {project.features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="mt-2 w-1 h-1 rounded-full bg-accent flex-shrink-0" />
                                    <Text size="sm" className="text-foreground">{feature}</Text>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}

                {/* Challenges */}
                {project.challenges && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Text size="xs" className="mb-3 font-medium uppercase tracking-[0.15em] text-muted-foreground">
                            Challenges
                        </Text>
                        <Text size="sm" className="leading-relaxed text-foreground">
                            {project.challenges}
                        </Text>
                    </motion.div>
                )}

                {/* Results */}
                {project.results && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Text size="xs" className="mb-3 font-medium uppercase tracking-[0.15em] text-muted-foreground">
                            Results
                        </Text>
                        <Text size="sm" className="leading-relaxed text-foreground">
                            {project.results}
                        </Text>
                    </motion.div>
                )}
            </ModalBody>

            <ModalFooter>
                {project.demoUrl && (
                    <Button
                        variant="primary"
                        size="md"
                        className="rounded-xl bg-foreground text-background"
                        onClick={() => window.open(project.demoUrl, '_blank')}
                    >
                        Visit Site
                        <svg className="ml-2 w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="md"
                    onClick={onClose}
                    className="text-muted hover:text-foreground"
                >
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
}
