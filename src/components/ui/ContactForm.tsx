"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, signInWithGoogle, signOutUser, auth } from "@/lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
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
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        message: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

    // Monitor authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);

            // Auto-fill email when user signs in
            if (currentUser?.email) {
                setFormData(prev => ({ ...prev, email: currentUser.email || "" }));
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSignIn = async () => {
        try {
            setAuthLoading(true);
            await signInWithGoogle();
        } catch (error) {
            console.error("Error signing in:", error);
            alert("Failed to sign in with Google. Please try again.");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOutUser();
            setFormData({ name: "", email: "", message: "" });
            setSubmitStatus("idle");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

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
            let currentUser = user;

            // If not authenticated, sign in first
            if (!currentUser) {
                currentUser = await signInWithGoogle();
                // Update form email with authenticated email
                setFormData(prev => ({ ...prev, email: currentUser?.email || "" }));
            }

            // Submit with authenticated user
            await addDoc(collection(db, "contact_submissions"), {
                name: formData.name,
                email: currentUser.email || formData.email,
                message: formData.message,
                userId: currentUser.uid,
                userEmail: currentUser.email,
                userDisplayName: currentUser.displayName,
                userPhotoURL: currentUser.photoURL,
                createdAt: serverTimestamp(),
                status: "new"
            });

            setSubmitStatus("success");
            setFormData({ name: "", email: currentUser.email || "", message: "" });
            setErrors({});
        } catch (error) {
            console.error("Error submitting form:", error);
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
                        <div className="space-y-6">
                            {/* User Info Card - Show only if authenticated */}
                            {user && (
                                <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border-white/20 dark:border-gray-700/20 shadow-xl">
                                    <CardContent className="pt-6 pb-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {user.photoURL && (
                                                    <img
                                                        src={user.photoURL}
                                                        alt={user.displayName || "User"}
                                                        className="w-12 h-12 rounded-full border-2 border-blue-500"
                                                    />
                                                )}
                                                <div>
                                                    <Text className="font-semibold">{user.displayName || "User"}</Text>
                                                    <Text size="sm" variant="muted">{user.email}</Text>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleSignOut}
                                            >
                                                Sign Out
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Contact Form - Always visible */}
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
                                                disabled={!!user || isSubmitting}
                                            />
                                            {user && (
                                                <Text size="sm" variant="muted" className="mt-1">
                                                    Using your Google account email
                                                </Text>
                                            )}
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

                                        {!user && (
                                            <motion.div variants={staggerItem}>
                                                <Alert variant="info" title="Authentication Required">
                                                    You'll be asked to sign in with Google when you submit this form.
                                                </Alert>
                                            </motion.div>
                                        )}

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
                                                    {!user ? (
                                                        <>
                                                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                            </svg>
                                                            Sign in & Send
                                                        </>
                                                    ) : (
                                                        "Send Message"
                                                    )}
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
                        </div>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
}
