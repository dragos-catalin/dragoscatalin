import type { ComponentType } from "react";
import { getTranslations } from "next-intl/server";
import { Package } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { DiscordIcon, GitHubIcon, InstagramIcon, TikTokIcon } from "@/components/icons";
import { ConsentSettingsButton } from "@/components/consent";
import { BrandMark } from "@/components/brand/BrandMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { site, type SocialKey } from "@/lib/site";
import pkg from "../../../package.json";

const NAV = [
    { key: "home", href: "/" },
    { key: "projects", href: "/projects" },
    { key: "services", href: "/services" },
    { key: "openSource", href: "/open-source" },
    { key: "lab", href: "/lab" },
    { key: "about", href: "/about" },
    { key: "now", href: "/now" },
    { key: "uses", href: "/uses" },
    { key: "press", href: "/press" },
    { key: "contact", href: "/#contact" },
] as const;

const SOCIALS: { key: SocialKey; label: string; Icon: ComponentType<{ className?: string }> }[] = [
    { key: "github", label: "GitHub", Icon: GitHubIcon },
    { key: "instagram", label: "Instagram", Icon: InstagramIcon },
    { key: "tiktok", label: "TikTok", Icon: TikTokIcon },
    { key: "discord", label: "Discord", Icon: DiscordIcon },
    { key: "npm", label: "npm", Icon: Package },
];

const SOURCE_URL = "https://github.com/dragos-catalin/dragoscatalin";
// Evaluated once at module load (build time) so the shell stays statically prerenderable.
const BUILD_YEAR = new Date().getFullYear();

export async function Footer() {
    const t = await getTranslations();
    const year = BUILD_YEAR;

    return (
        <footer className="border-t border-line bg-bg-deep">
            <div className="container-x py-14 md:py-20">
                <div className="grid gap-12 md:grid-cols-3">
                    <div className="flex flex-col gap-4">
                        <Link
                            href="/"
                            className="brand-link inline-flex items-center gap-2.5 self-start rounded-pill text-fg"
                        >
                            <BrandMark className="size-9" />
                            <Wordmark className="text-xl" />
                        </Link>
                        <p className="max-w-xs text-sm text-pretty text-fg-muted">
                            {t("meta.description")}
                        </p>
                    </div>

                    <nav aria-label={t("nav.menu")}>
                        <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
                            {NAV.map((item) => (
                                <li key={item.key}>
                                    <Link
                                        href={item.href}
                                        className="inline-flex min-h-9 items-center text-sm text-fg-muted transition-colors hover:text-fg"
                                    >
                                        {t(`nav.${item.key}`)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <ul
                        className="flex flex-wrap items-start gap-2 md:justify-end"
                        aria-label={t("common.external")}
                    >
                        {SOCIALS.map(({ key, label, Icon }) => (
                            <li key={key}>
                                <a
                                    href={site.socials[key]}
                                    target="_blank"
                                    rel="me noopener"
                                    aria-label={`${label} ${t("common.external")}`}
                                    className="inline-flex size-11 items-center justify-center rounded-pill text-fg-muted transition-colors hover:bg-accent-soft hover:text-fg"
                                >
                                    <Icon className="size-5" />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 text-xs text-fg-subtle md:flex-row md:items-center md:justify-between">
                    <p>{t("footer.rights", { year })}</p>
                    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <li className="font-mono">
                            {t("footer.version", { version: pkg.version })}
                        </li>
                        <li>
                            <a
                                href="/feed.xml"
                                className="link-inline transition-colors hover:text-fg"
                            >
                                {t("footer.feed")}
                            </a>
                        </li>
                        <li>
                            <a
                                href="/llms.txt"
                                className="link-inline transition-colors hover:text-fg"
                            >
                                {t("footer.llms")}
                            </a>
                        </li>
                        <li>
                            <Link
                                href="/privacy"
                                className="link-inline transition-colors hover:text-fg"
                            >
                                {t("footer.privacy")}
                            </Link>
                        </li>
                        <li>
                            <ConsentSettingsButton className="link-inline inline-flex min-h-6 items-center transition-colors hover:text-fg" />
                        </li>
                        <li>
                            <a
                                href={SOURCE_URL}
                                target="_blank"
                                rel="noopener"
                                className="link-inline transition-colors hover:text-fg"
                            >
                                {t("footer.source")}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}
