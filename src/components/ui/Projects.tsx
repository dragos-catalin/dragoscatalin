"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heading, Text } from "./Typography";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card";
import Badge from "./Badge";
import Container from "./Container";
import Button from "./Button";
import ProjectModal from "./ProjectModal";
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
        id: "3",
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
        <section id="projects" className="relative py-20 overflow-hidden">

            <Container className="relative z-10">
                <div className="space-y-12">
                    {/* Section Header */}
                    <motion.div
                        className="text-center space-y-4"
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportConfig}
                        variants={fadeInUp}
                    >
                        <Heading as="h2" className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200 bg-clip-text text-transparent">Projects</Heading>
                        <Text size="lg" variant="muted" className="max-w-2xl mx-auto text-lg">
                            A selection of projects showcasing my skills in web development,
                            design, and problem-solving.
                        </Text>
                    </motion.div>

                    {/* Projects Grid */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportConfig}
                    >
                        {projects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                variants={staggerItem}
                                whileHover={{ y: -12, scale: 1.02, transition: { duration: 0.3 } }}
                                onClick={() => handleProjectClick(project)}
                                className="cursor-pointer"
                            >
                                <Card className="flex flex-col h-full backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10 transition-all duration-300">
                                    <CardHeader>
                                        <CardTitle>{project.title}</CardTitle>
                                        <CardDescription>{project.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <div className="space-y-4">
                                            <div>
                                                <Text size="sm" variant="muted" className="mb-2 font-semibold">
                                                    Technologies:
                                                </Text>
                                                <div className="flex flex-wrap gap-2">
                                                    {project.technologies.map((tech) => (
                                                        <Badge key={tech} variant="info" size="sm">
                                                            {tech}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="gap-3">
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleProjectClick(project);
                                                }}
                                            >
                                                View Details
                                            </Button>
                                        </motion.div>
                                    </CardFooter>
                                </Card>
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
