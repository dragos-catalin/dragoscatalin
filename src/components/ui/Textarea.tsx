import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, helperText, id, ...props }, ref) => {
        const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="mb-2 block text-sm font-medium text-foreground"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    id={textareaId}
                    className={cn(
                        "flex min-h-[120px] w-full rounded-xl border border-border bg-surface/50 px-3 py-2 text-sm text-foreground",
                        "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "transition-all duration-200 resize-y",
                        error && "border-red-500/50 focus:ring-red-500/30",
                        className
                    )}
                    ref={ref}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={
                        error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
                    }
                    {...props}
                />
                {error && (
                    <p id={`${textareaId}-error`} className="mt-1 text-sm text-red-600">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p id={`${textareaId}-helper`} className="mt-1 text-sm text-gray-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";

export default Textarea;
