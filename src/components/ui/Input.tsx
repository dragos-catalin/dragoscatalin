import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="mb-2 block text-sm font-medium text-foreground"
                    >
                        {label}
                    </label>
                )}
                <input
                    id={inputId}
                    className={cn(
                        "flex h-10 w-full rounded-xl border border-border bg-surface/50 px-3 py-2 text-sm text-foreground",
                        "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "transition-all duration-200",
                        error && "border-red-500/50 focus:ring-red-500/30",
                        className
                    )}
                    ref={ref}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={
                        error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
                    }
                    {...props}
                />
                {error && (
                    <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
