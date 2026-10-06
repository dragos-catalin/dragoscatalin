"use client";

import { useActionState, useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { subscribeAction, type NewsletterState } from "@/app/actions/newsletter";
import { Button } from "@/components/ui";
import { Link } from "@/i18n/navigation";

const initial: NewsletterState = { ok: false };

function SubmitButton() {
    const t = useTranslations("newsletter");
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} aria-busy={pending}>
            {pending ? t("sending") : t("submit")}
        </Button>
    );
}

const inputClass =
    "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-fg placeholder:text-fg-subtle outline-none transition focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40 aria-[invalid=true]:border-danger";

export function NewsletterForm() {
    const t = useTranslations("newsletter");
    const locale = useLocale();
    const [state, action] = useActionState(subscribeAction, initial);
    const [clientError, setClientError] = useState<"email" | "consent" | null>(null);
    const id = useId();

    if (state.ok) {
        return (
            <p
                role="status"
                className="max-w-prose rounded-lg border border-line bg-surface-raised p-4 text-success"
            >
                {state.status === "subscribed" ? t("already") : t("pending")}
            </p>
        );
    }

    const emailErr =
        clientError === "email" || (state.code === "invalid" && clientError !== "consent");
    const serverMsg =
        state.code === "disabled"
            ? t("disabled")
            : state.code === "rate"
              ? t("rate")
              : state.code === "error"
                ? t("error")
                : null;

    return (
        <form
            action={action}
            noValidate
            onSubmit={(e) => {
                const data = new FormData(e.currentTarget);
                const email = String(data.get("email") ?? "").trim();
                const next = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                    ? "email"
                    : data.get("consent") !== "on"
                      ? "consent"
                      : null;
                setClientError(next);
                if (next) e.preventDefault();
            }}
            className="flex max-w-xl flex-col gap-5"
        >
            <div className="flex flex-col gap-1.5">
                <label htmlFor={`${id}-email`} className="text-sm font-medium text-fg">
                    {t("email")}
                </label>
                <input
                    id={`${id}-email`}
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={320}
                    aria-invalid={emailErr ? true : undefined}
                    aria-describedby={emailErr ? `${id}-email-error` : undefined}
                    className={inputClass}
                    onChange={() => clientError === "email" && setClientError(null)}
                />
                {emailErr ? (
                    <p id={`${id}-email-error`} className="text-sm text-danger">
                        {t("invalidEmail")}
                    </p>
                ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="flex items-start gap-3">
                    <input
                        id={`${id}-consent`}
                        name="consent"
                        type="checkbox"
                        required
                        aria-invalid={clientError === "consent" ? true : undefined}
                        aria-describedby={
                            clientError === "consent" ? `${id}-consent-error` : undefined
                        }
                        className="mt-1 size-5 shrink-0 accent-accent"
                        onChange={() => clientError === "consent" && setClientError(null)}
                    />
                    <label htmlFor={`${id}-consent`} className="text-sm text-pretty text-fg-muted">
                        {t("consent")}{" "}
                        <Link href="/privacy#newsletter" className="link-inline text-accent">
                            {t("privacyLink")}
                        </Link>
                    </label>
                </div>
                {clientError === "consent" ? (
                    <p id={`${id}-consent-error`} className="text-sm text-danger">
                        {t("consentRequired")}
                    </p>
                ) : null}
            </div>

            {/* Honeypot: bots fill it, humans never see it. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor={`${id}-company`}>Company</label>
                <input
                    id={`${id}-company`}
                    name="company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    defaultValue=""
                />
            </div>
            <input type="hidden" name="locale" value={locale} />

            {serverMsg ? (
                <p role="status" className="text-sm text-danger">
                    {serverMsg}
                </p>
            ) : null}

            <div>
                <SubmitButton />
            </div>
        </form>
    );
}
