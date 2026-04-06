"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heading, Text } from "./Typography";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card";
import Badge from "./Badge";
import Container from "./Container";
import Button from "./Button";
import ProjectModal from "./ProjectModal";
import WebsitePreview from "./WebsitePreview";
import { fadeInUp, staggerContainer, staggerItem, viewportConfig } from "@/lib/animations";

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

const projects: Project[] = [
    {
        id: "1",
        title: "StudiAI.ro",
        description: "AI-powered courses platform for personalized learning experiences with interactive content and progress tracking.",
        fullDescription: "StudiAI.ro is an innovative online learning platform that leverages artificial intelligence to deliver personalized educational experiences. The platform offers interactive courses, adaptive learning paths, and real-time progress tracking to help students achieve their learning goals.",
        technologies: ["Next.js", "TypeScript", "AI/ML", "PostgreSQL"],
        features: [
            "AI-powered personalized learning paths",
            "Interactive course content with quizzes and exercises",
            "Real-time progress tracking and analytics",
            "Student dashboard with achievements and certificates",
            "Instructor tools for course creation and management",
            "Mobile-responsive design for learning on the go"
        ],
        challenges: "Integrating AI algorithms for personalized learning recommendations while maintaining fast performance required careful optimization of database queries and implementing efficient caching strategies.",
        results: "Successfully serving hundreds of students with personalized learning experiences and maintaining 95% course completion rates.",
        demoUrl: "https://studiai.ro",
        githubUrl: "#",
    },
    {
        id: "2",
        title: "Datuvia.ro",
        description: "Business management platform for clients, contracts, invoicing, and debt recovery with ANAF integration and digital signatures.",
        fullDescription: "Datuvia.ro is a comprehensive business management platform built for Romanian companies. It centralizes client management, digital contracts with electronic signatures, automated invoicing with FGO sync, and a full debt recovery module with legal case tracking. The platform supports multi-company setups, role-based access, and real-time notifications.",
        technologies: ["Next.js", "TypeScript", "PostgreSQL", "Prisma"],
        features: [
            "Complete client management with ANAF verification",
            "Digital contracts with electronic signature support",
            "Automated invoicing with FGO synchronization",
            "Debt recovery module with legal case timeline",
            "Multi-company support with separate configurations",
            "Role-based access control for managers, accountants, and lawyers"
        ],
        challenges: "Building a multi-tenant architecture supporting multiple companies per account while integrating with ANAF APIs for real-time fiscal data verification and ensuring GDPR compliance across all modules.",
        results: "Serving 300+ active companies with over 12,000 digitally signed contracts and 99.9% platform uptime.",
        demoUrl: "https://datuvia.ro",
        githubUrl: "#",
    },
    {
        id: "3",
        title: "EditAI.ro",
        description: "Advanced AI-powered media editing platform with automated tools for photo, video, and audio enhancement.",
        fullDescription: "EditAI.ro is a cutting-edge platform that uses artificial intelligence to simplify and enhance media editing workflows. The platform provides powerful tools for photo enhancement, video editing, audio processing, and automated content generation.",
        technologies: ["Next.js", "Python", "TensorFlow", "AWS"],
        features: [
            "AI-powered photo enhancement and restoration",
            "Automated video editing with smart scene detection",
            "Audio noise reduction and voice enhancement",
            "Background removal and object detection",
            "Batch processing for multiple files",
            "Cloud-based rendering for fast processing"
        ],
        challenges: "Processing large media files with AI models required implementing a scalable cloud infrastructure with AWS and optimizing machine learning models for real-time performance.",
        results: "Processing thousands of media files daily with 90% customer satisfaction rate and average processing time of under 30 seconds per file.",
        demoUrl: "https://editai.ro",
        githubUrl: "#",
    },
    {
        id: "4",
        title: "MancAI.ro",
        description: "Food tracking application with AI image analysis for automatic nutritional information and calorie counting.",
        fullDescription: "MancAI.ro is a smart food tracking platform that uses advanced AI image recognition to analyze food photos and provide instant nutritional information. Users can simply take a picture of their meal to automatically log calories, macros, and nutritional data.",
        technologies: ["Next.js", "TypeScript", "AI/ML", "Python", "TensorFlow"],
        features: [
            "AI-powered food recognition from photos",
            "Automatic calorie and macro calculation",
            "Personalized nutrition goals and tracking",
            "Meal history and analytics dashboard",
            "Recipe suggestions based on dietary preferences",
            "Integration with fitness apps and wearables"
        ],
        challenges: "Training accurate AI models to recognize diverse food types and portions required building a comprehensive dataset and implementing efficient image processing pipelines for real-time analysis.",
        results: "Achieving 92% accuracy in food recognition and helping users track over 100,000 meals with automated nutritional analysis.",
        demoUrl: "https://mancai.ro",
        githubUrl: "#",
    },
];

export default function Projects() {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleProjectClick = (project: Project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedProject(null), 300);
    };

    return (
        <section id="projects" className="relative py-32 overflow-hidden">
            {/* Section divider */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            <Container className="relative z-10">
                <div className="space-y-16">
                    {/* Section Header */}
                    <motion.div
                        className="space-y-4"
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportConfig}
                        variants={fadeInUp}
                    >
                        <Text size="xs" className="text-accent uppercase tracking-[0.2em] font-medium">
                            Selected work
                        </Text>
                        <Heading as="h2" className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                            Projects
                        </Heading>
                        <Text size="base" className="text-muted max-w-lg">
                            A selection of projects showcasing my skills in web development,
                            design, and problem-solving.
                        </Text>
                    </motion.div>

                    {/* Projects Grid */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportConfig}
                    >
                        {projects.map((project) => (
                            <motion.div
                                key={project.id}
                                variants={staggerItem}
                                onClick={() => handleProjectClick(project)}
                                className="cursor-pointer group"
                            >
                                <div className="relative flex flex-col h-full rounded-2xl border border-border bg-surface/50 hover:bg-surface-raised/80 overflow-hidden transition-all duration-300 hover:border-accent/20 hover:shadow-lg hover:shadow-accent/5 gradient-border">
                                    {/* Website Preview */}
                                    {project.demoUrl && (
                                        <WebsitePreview
                                            url={project.demoUrl}
                                            alt={project.title}
                                            className="w-full h-48 border-b border-border"
                                        />
                                    )}

                                    <div className="p-6">
                                        {/* Project number */}
                                        <span className="absolute top-6 right-6 text-xs font-mono text-muted-foreground z-10">
                                            {project.id.padStart(2, "0")}
                                        </span>

                                        <div className="flex flex-col h-full">
                                            <h3 className="text-xl font-semibold tracking-tight text-foreground mb-2 group-hover:text-accent transition-colors duration-200">
                                                {project.title}
                                            </h3>
                                            <p className="text-sm text-muted leading-relaxed mb-6 flex-grow">
                                                {project.description}
                                            </p>

                                            {/* Technologies */}
                                            <div className="flex flex-wrap gap-1.5 mb-5">
                                                {project.technologies.map((tech) => (
                                                    <span
                                                        key={tech}
                                                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface-raised text-muted border border-border"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Action */}
                                            <div className="flex items-center gap-2 text-sm font-medium text-muted group-hover:text-accent transition-colors duration-200">
                                                <span>View project</span>
                                                <svg
                                                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </Container>

            {/* Project Modal */}
            <ProjectModal
                project={selectedProject}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </section>
    );
}
