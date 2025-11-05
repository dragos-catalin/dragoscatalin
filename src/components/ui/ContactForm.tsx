"use client";

import React, { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, ensureAnonymousAuth } from "@/lib/firebase";
import { Heading, Text } from "./Typography";
import Input from "./Input";
import Textarea from "./Textarea";
import Button from "./Button";
import Alert from "./Alert";
import Container from "./Container";
import { Card, CardContent } from "./Card";
import { fadeInUp, staggerContainer, staggerItem, viewportConfig } from "@/lib/animations";
import { GitHubIcon, InstagramIcon, TikTokIcon, DiscordIcon } from "@/components/icons";
import { socialLinks } from "@/lib/socials";

interface FormData {
    name: string;
    email: string;
    message: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    message?: string;
}

export default function ContactForm() {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        message: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!formData.message.trim()) {
            newErrors.message = "Message is required";
        } else if (formData.message.trim().length < 10) {
            newErrors.message = "Message must be at least 10 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus("idle");

        try {
            // Ensure user is authenticated anonymously before submission
            await ensureAnonymousAuth();

            // Store contact form submission in Firestore
            await addDoc(collection(db, "contact_submissions"), {
                name: formData.name,
                email: formData.email,
                message: formData.message,
                createdAt: serverTimestamp(),
                status: "new"
            });

            setSubmitStatus("success");
            setFormData({ name: "", email: "", message: "" });
            setErrors({});
        } catch (error) {
            setSubmitStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    return (
        <section id="contact" className="relative py-20 overflow-hidden">

            <Container size="md" className="relative z-10">
                <div className="space-y-12">
                    {/* Section Header */}
                    <motion.div
                        className="text-center space-y-4"
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportConfig}
                        variants={fadeInUp}
                    >
                        <Heading as="h2" className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200 bg-clip-text text-transparent">Get In Touch</Heading>
                        <Text size="lg" variant="muted" className="max-w-2xl mx-auto text-lg">
                            Have a question or want to work together? Feel free to reach out!
                        </Text>
                    </motion.div>

                    {/* Social Links */}
                    <motion.div
                        className="flex justify-center gap-4"
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportConfig}
                        variants={fadeInUp}
                    >
                        {socialLinks.map((social) => (
                            <motion.a
                                key={social.name}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-full bg-blue-500/10 hover:bg-blue-500/20 dark:bg-gray-700/50 dark:hover:bg-gray-600/50 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl"
                                aria-label={social.name}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {social.icon === "github" && <GitHubIcon className="w-6 h-6" />}
                                {social.icon === "instagram" && <InstagramIcon className="w-6 h-6" />}
                                {social.icon === "tiktok" && <TikTokIcon className="w-6 h-6" />}
                                {social.icon === "discord" && <DiscordIcon className="w-6 h-6" />}
                            </motion.a>
                        ))}
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportConfig}
                        variants={fadeInUp}
                    >
                        <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border-white/20 dark:border-gray-700/20 shadow-2xl">
                            <CardContent className="pt-8 pb-8">
                                <motion.form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                    variants={staggerContainer}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <motion.div variants={staggerItem}>
                                        <Input
                                            label="Name"
                                            name="name"
                                            type="text"
                                            placeholder="Your name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            error={errors.name}
                                            disabled={isSubmitting}
                                        />
                                    </motion.div>

                                    <motion.div variants={staggerItem}>
                                        <Input
                                            label="Email"
                                            name="email"
                                            type="email"
                                            placeholder="your.email@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            error={errors.email}
                                            disabled={isSubmitting}
                                        />
                                    </motion.div>

                                    <motion.div variants={staggerItem}>
                                        <Textarea
                                            label="Message"
                                            name="message"
                                            placeholder="Your message..."
                                            rows={6}
                                            value={formData.message}
                                            onChange={handleChange}
                                            error={errors.message}
                                            disabled={isSubmitting}
                                        />
                                    </motion.div>

                                    <motion.div variants={staggerItem}>
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                size="lg"
                                                className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 text-lg font-semibold"
                                                isLoading={isSubmitting}
                                                disabled={isSubmitting}
                                            >
                                                Send Message
                                            </Button>
                                        </motion.div>
                                    </motion.div>

                                    {submitStatus === "success" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <Alert variant="success" title="Message Sent!">
                                                Thank you for your message. I'll get back to you soon!
                                            </Alert>
                                        </motion.div>
                                    )}

                                    {submitStatus === "error" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <Alert variant="error" title="Error">
                                                Something went wrong. Please try again later.
                                            </Alert>
                                        </motion.div>
                                    )}
                                </motion.form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
}
