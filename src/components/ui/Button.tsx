import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const base =
    "inline-flex items-center justify-center gap-2 rounded-pill font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out-expo select-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const variants: Record<ButtonVariant, string> = {
    primary: "bg-accent text-accent-fg shadow-glow-sm hover:bg-accent-strong",
    secondary: "surface text-fg hover:border-line-strong hover:bg-surface-raised",
    ghost: "text-fg-muted hover:bg-accent-soft hover:text-fg",
    link: "text-accent underline-offset-4 hover:underline rounded-none px-0",
};

const sizes: Record<ButtonSize, string> = {
    sm: "min-h-9 px-3.5 text-sm",
    md: "min-h-11 px-5 text-sm",
    lg: "min-h-13 px-7 text-base",
};

export function buttonClasses(
    variant: ButtonVariant = "primary",
    size: ButtonSize = "md",
    className?: string,
) {
    return cn(base, variants[variant], variant === "link" ? "min-h-0" : sizes[size], className);
}

interface StyleProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children?: ReactNode;
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & StyleProps;

export function Button({
    variant = "primary",
    size = "md",
    className,
    type = "button",
    ...rest
}: ButtonProps) {
    return <button type={type} className={buttonClasses(variant, size, className)} {...rest} />;
}

export type ButtonLinkProps = ComponentProps<typeof Link> & StyleProps;

export function ButtonLink({
    variant = "primary",
    size = "md",
    className,
    ...rest
}: ButtonLinkProps) {
    return <Link className={buttonClasses(variant, size, className)} {...rest} />;
}
