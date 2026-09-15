import { Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ComponentType } from "react";
import { ContactForm } from "@/components/contact/ContactForm";
import { DiscordIcon, GitHubIcon, InstagramIcon, TikTokIcon } from "@/components/icons";
import { Section } from "@/components/ui";
import { site } from "@/lib/site";

const LINKS: {
    key: string;
    label: string;
    href: string;
    Icon: ComponentType<{ className?: string }>;
}[] = [
    { key: "email", label: site.email, href: `mailto:${site.email}`, Icon: Mail },
    { key: "github", label: "GitHub", href: site.socials.github, Icon: GitHubIcon },
    { key: "instagram", label: "Instagram", href: site.socials.instagram, Icon: InstagramIcon },
    { key: "tiktok", label: "TikTok", href: site.socials.tiktok, Icon: TikTokIcon },
    { key: "discord", label: "Discord", href: site.socials.discord, Icon: DiscordIcon },
];

export async function ContactSection() {
    const t = await getTranslations("contact");
    const tc = await getTranslations("common");

    return (
        <Section id="contact" eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")}>
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="flex flex-col gap-8">
                    <p className="max-w-prose text-lg text-fg-muted">{t("copy")}</p>
                    <ul className="flex flex-col gap-3">
                        {LINKS.map(({ key, label, href, Icon }) => {
                            const external = !href.startsWith("mailto:");
                            return (
                                <li key={key}>
                                    <a
                                        href={href}
                                        {...(external
                                            ? { target: "_blank", rel: "noopener noreferrer me" }
                                            : { rel: "me" })}
                                        className="inline-flex items-center gap-3 text-fg transition hover:text-accent focus-visible:text-accent"
                                    >
                                        <Icon className="size-5 shrink-0" aria-hidden="true" />
                                        <span>{label}</span>
                                        {external ? (
                                            <span className="sr-only">{tc("external")}</span>
                                        ) : null}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="rounded-2xl border border-line bg-surface-raised p-6 sm:p-8">
                    <ContactForm />
                </div>
            </div>
        </Section>
    );
}
