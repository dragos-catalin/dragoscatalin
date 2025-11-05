"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { hasNewMessages } from "@/lib/contactNotifications";
import { ensureAnonymousAuth } from "@/lib/firebase";

export default function NotificationBadge() {
    const [showNotification, setShowNotification] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkForNewMessages = async () => {
            try {
                await ensureAnonymousAuth();
                const hasNew = await hasNewMessages();
                setShowNotification(hasNew);
            } catch (error) {
                // Silently fail
            } finally {
                setIsLoading(false);
            }
        };

        checkForNewMessages();

        // Check every 5 minutes for new messages
        const interval = setInterval(checkForNewMessages, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    if (isLoading || !showNotification) {
        return null;
    }

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative inline-flex"
        >
            {/* Pulsing outer ring */}
            <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.75, 0.3, 0.75],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Inner dot */}
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-lg shadow-red-500/50" />
        </motion.div>
    );
}
