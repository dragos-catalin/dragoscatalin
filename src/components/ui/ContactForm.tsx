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
        <section id="contact" className="relative py-32 overflow-hidden">
            {/* Section divider */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            <Container size="md" className="relative z-10">
                <div className="space-y-12">
                    {/* Section Header */}
                    <motion.div
                        className="space-y-4"
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportConfig}
                        variants={fadeInUp}
                    >
                        <Text size="xs" className="text-accent uppercase tracking-[0.2em] font-medium">
                            Contact
                        </Text>
                        <Heading as="h2" className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                            Get in touch
                        </Heading>
                        <Text size="base" className="text-muted max-w-lg">
                            Have a question or want to work together? Feel free to reach out.
                        </Text>
                    </motion.div>

                    {/* Social Links */}
                    <motion.div
                        className="flex gap-3"
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
                                className="p-3 rounded-xl border border-border bg-surface/50 text-muted hover:text-foreground hover:border-accent/30 hover:bg-accent/5 transition-all duration-200"
                                aria-label={social.name}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {social.icon === "github" && <GitHubIcon className="w-5 h-5" />}
                                {social.icon === "instagram" && <InstagramIcon className="w-5 h-5" />}
                                {social.icon === "tiktok" && <TikTokIcon className="w-5 h-5" />}
                                {social.icon === "discord" && <DiscordIcon className="w-5 h-5" />}
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
                        <div className="space-y-4">
                            {/* User Info Card */}
                            {user && (
                                <div className="flex items-center justify-between rounded-xl border border-border bg-surface/50 p-4">
                                    <div className="flex items-center gap-3">
                                        {user.photoURL && (
                                            <img
                                                src={user.photoURL}
                                                alt={user.displayName || "User"}
                                                className="w-10 h-10 rounded-full border border-border"
                                            />
                                        )}
                                        <div>
                                            <Text size="sm" className="font-medium text-foreground">{user.displayName || "User"}</Text>
                                            <Text size="xs" className="text-muted">{user.email}</Text>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSignOut}
                                        className="text-muted hover:text-foreground"
                                    >
                                        Sign Out
                                    </Button>
                                </div>
                            )}

                            {/* Form */}
                            <div className="rounded-2xl border border-border bg-surface/50 p-6 sm:p-8">
                                <motion.form
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
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
                                            <Text size="xs" className="mt-1.5 text-muted">
                                                Using your Google account email
                                            </Text>
                                        )}
                                    </motion.div>

                                    <motion.div variants={staggerItem}>
                                        <Textarea
                                            label="Message"
                                            name="message"
                                            placeholder="Tell me about your project..."
                                            rows={5}
                                            value={formData.message}
                                            onChange={handleChange}
                                            error={errors.message}
                                            disabled={isSubmitting}
                                        />
                                    </motion.div>

                                    {!user && (
                                        <motion.div variants={staggerItem}>
                                            <Alert variant="info" title="Authentication Required">
                                                You&apos;ll be asked to sign in with Google when you submit this form.
                                            </Alert>
                                        </motion.div>
                                    )}

                                    <motion.div variants={staggerItem}>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90 h-12 text-sm font-medium"
                                            isLoading={isSubmitting}
                                            disabled={isSubmitting}
                                        >
                                            {!user ? "Sign in & Send" : "Send Message"}
                                        </Button>
                                    </motion.div>

                                    {submitStatus === "success" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <Alert variant="success" title="Message Sent!">
                                                Thank you for your message. I&apos;ll get back to you soon!
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
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
}
