"use client";

import { useActionState, useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Turnstile } from "@marsidev/react-turnstile";
import { contactAction, type ContactState } from "@/app/actions/contact";
import { Button } from "@/components/ui";
import { useTheme } from "@/components/theme/ThemeProvider";
import { clientEnv } from "@/lib/env.client";
import { site } from "@/lib/site";

const initial: ContactState = { ok: false };

type Field = "name" | "email" | "message";

function SubmitButton() {
    const t = useTranslations("contact");
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} aria-busy={pending}>
            {pending ? t("sending") : t("send")}
        </Button>
    );
}

const inputClass =
    "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-fg placeholder:text-fg-subtle outline-none transition focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40 aria-[invalid=true]:border-danger";

export function ContactForm() {
    const t = useTranslations("contact");
    const locale = useLocale();
    const { resolvedMode } = useTheme();
    const [state, action] = useActionState(contactAction, initial);
    const [clientErrors, setClientErrors] = useState<Partial<Record<Field, string>>>({});
    // Turnstile (third-party) loads only once the visitor starts using the form, never on page load.
    const [engaged, setEngaged] = useState(false);
    const id = useId();
    const turnstileKey = clientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    const errorFor = (field: Field): string | undefined => {
        if (clientErrors[field]) return clientErrors[field];
        if (state.code === "invalid" && state.fieldErrors?.[field]) return t(`validation.${field}`);
        return undefined;
    };

    const validate = (form: HTMLFormElement): boolean => {
        const data = new FormData(form);
        const next: Partial<Record<Field, string>> = {};
        const name = String(data.get("name") ?? "").trim();
        const email = String(data.get("email") ?? "").trim();
        const message = String(data.get("message") ?? "").trim();
        if (name.length < 2 || name.length > 80) next.name = t("validation.name");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t("validation.email");
        if (message.length < 20 || message.length > 4000) next.message = t("validation.message");
        setClientErrors(next);
        return Object.keys(next).length === 0;
    };

    if (state.ok) {
        return (
            <p
                role="status"
                className="rounded-lg border border-line bg-surface-raised p-4 text-success"
            >
                {t("success")}
            </p>
        );
    }

    const fields: { name: Field; type: "text" | "email" | "textarea"; autoComplete: string }[] = [
        { name: "name", type: "text", autoComplete: "name" },
        { name: "email", type: "email", autoComplete: "email" },
        { name: "message", type: "textarea", autoComplete: "off" },
    ];

    return (
        <form
            action={action}
            noValidate
            onFocus={() => {
                if (!engaged) setEngaged(true);
            }}
            onSubmit={(e) => {
                if (!validate(e.currentTarget)) e.preventDefault();
            }}
            className="flex flex-col gap-5"
        >
            {fields.map((f) => {
                const err = errorFor(f.name);
                const inputId = `${id}-${f.name}`;
                const errId = `${inputId}-error`;
                const common = {
                    id: inputId,
                    name: f.name,
                    required: true,
                    autoComplete: f.autoComplete,
                    "aria-invalid": err ? true : undefined,
                    "aria-describedby": err ? errId : undefined,
                    className: inputClass,
                    onChange: () => {
                        if (clientErrors[f.name])
                            setClientErrors((c) => ({ ...c, [f.name]: undefined }));
                    },
                } as const;
                return (
                    <div key={f.name} className="flex flex-col gap-1.5">
                        <label htmlFor={inputId} className="text-sm font-medium text-fg">
                            {t(f.name)}
                        </label>
                        {f.type === "textarea" ? (
                            <textarea {...common} rows={6} minLength={20} maxLength={4000} />
                        ) : (
                            <input
                                {...common}
                                type={f.type}
                                maxLength={f.name === "name" ? 80 : 200}
                            />
                        )}
                        {err ? (
                            <p id={errId} className="text-sm text-danger">
                                {err}
                            </p>
                        ) : null}
                    </div>
                );
            })}

            {/* Honeypot: bots fill it, humans never see it. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor={`${id}-website`}>Website</label>
                <input
                    id={`${id}-website`}
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    defaultValue=""
                />
            </div>
            <input type="hidden" name="locale" value={locale} />

            {turnstileKey && engaged ? (
                <Turnstile
                    siteKey={turnstileKey}
                    options={{ theme: resolvedMode, language: locale, size: "flexible" }}
                />
            ) : null}

            {state.code === "disabled" ? (
                <p role="status" className="text-sm text-fg-muted">
                    {t("disabled", { email: site.email })}{" "}
                    <a
                        href={`mailto:${site.email}`}
                        className="text-accent underline underline-offset-4"
                    >
                        {site.email}
                    </a>
                </p>
            ) : null}
            {state.code === "error" ? (
                <p role="status" className="text-sm text-danger">
                    {t("error")}
                </p>
            ) : null}

            <div>
                <SubmitButton />
            </div>
        </form>
    );
}
