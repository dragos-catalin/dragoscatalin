"use client";

import React from "react";
import { motion } from "framer-motion";
import Modal, { ModalHeader, ModalBody, ModalFooter } from "./Modal";
import { Heading, Text } from "./Typography";
import Badge from "./Badge";
import Button from "./Button";

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
                <Heading as="h2" className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200 bg-clip-text text-transparent pr-8">
                    {project.title}
                </Heading>
            </ModalHeader>

            <ModalBody className="space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Project Image */}
                {project.image && (
                    <motion.div
                        className="w-full h-64 bg-gradient-to-br from-blue-100 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                )}

                {/* Technologies */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Text size="sm" variant="muted" className="mb-3 font-semibold uppercase tracking-wider">
                        Technologies Used
                    </Text>
                    <div className="flex flex-wrap gap-2">
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
                    <Text size="sm" variant="muted" className="mb-3 font-semibold uppercase tracking-wider">
                        Overview
                    </Text>
                    <Text size="base" className="leading-relaxed">
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
                        <Text size="sm" variant="muted" className="mb-3 font-semibold uppercase tracking-wider">
                            Key Features
                        </Text>
                        <ul className="space-y-2">
                            {project.features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0" />
                                    <Text size="base">{feature}</Text>
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
                        <Text size="sm" variant="muted" className="mb-3 font-semibold uppercase tracking-wider">
                            Challenges & Solutions
                        </Text>
                        <Text size="base" className="leading-relaxed">
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
                        <Text size="sm" variant="muted" className="mb-3 font-semibold uppercase tracking-wider">
                            Results & Impact
                        </Text>
                        <Text size="base" className="leading-relaxed">
                            {project.results}
                        </Text>
                    </motion.div>
                )}
            </ModalBody>

            <ModalFooter>
                {project.demoUrl && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="primary"
                            size="md"
                            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20"
                            onClick={() => window.open(project.demoUrl, '_blank')}
                        >
                            Visit Site
                        </Button>
                    </motion.div>
                )}
                <Button
                    variant="outline"
                    size="md"
                    onClick={onClose}
                >
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
}
