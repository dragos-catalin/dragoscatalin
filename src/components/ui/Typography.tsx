import React from "react";
import { cn } from "@/lib/utils";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    children: React.ReactNode;
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
    ({ className, as: Tag = "h2", children, ...props }, ref) => {
        const styles = {
            h1: "text-4xl font-bold tracking-tight sm:text-5xl",
            h2: "text-3xl font-bold tracking-tight sm:text-4xl",
            h3: "text-2xl font-semibold tracking-tight sm:text-3xl",
            h4: "text-xl font-semibold tracking-tight sm:text-2xl",
            h5: "text-lg font-semibold tracking-tight sm:text-xl",
            h6: "text-base font-semibold tracking-tight sm:text-lg",
        };

        return (
            <Tag
                ref={ref}
                className={cn(styles[Tag], className)}
                {...props}
            >
                {children}
            </Tag>
        );
    }
);

Heading.displayName = "Heading";

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    size?: "xs" | "sm" | "base" | "lg" | "xl";
    variant?: "default" | "muted" | "subtle";
    children: React.ReactNode;
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
    ({ className, size = "base", variant = "default", children, ...props }, ref) => {
        const sizes = {
            xs: "text-xs",
            sm: "text-sm",
            base: "text-base",
            lg: "text-lg",
            xl: "text-xl",
        };

        const variants = {
            default: "text-foreground",
            muted: "text-muted",
            subtle: "text-muted-foreground",
        };

        return (
            <p
                ref={ref}
                className={cn(sizes[size], variants[variant], className)}
                {...props}
            >
                {children}
            </p>
        );
    }
);

Text.displayName = "Text";

export { Heading, Text };
