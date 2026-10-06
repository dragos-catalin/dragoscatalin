import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
    const t = useTranslations("notFound");
    return (
        <section className="container-x flex min-h-[60dvh] flex-col items-start justify-center gap-6 py-24">
            <p className="font-mono text-sm text-accent">404</p>
            <h1 className="font-display text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-fg">
                {t("title")}
            </h1>
            <p className="max-w-prose text-lg text-fg-muted">{t("body")}</p>
            <ButtonLink href="/" variant="primary">
                {t("home")}
            </ButtonLink>
        </section>
    );
}
