import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { HEADER_OFFSET_CLASS } from "@/components/layout/header-offset";
import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/layout/SkipLink";
import { PersonJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { routing } from "@/i18n/routing";
import { DEFAULT_THEME, THEME_INIT_SCRIPT } from "@/lib/theme";
import { site } from "@/lib/site";
import { localeAlternates } from "@/lib/seo";
import "../globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin", "latin-ext"],
    display: "swap",
    // Keep preload: measured 2026-09-15, `preload: false` here made mobile FCP
    // worse (1057 → 1360 ms) because the swap happens later. Mono is not preloaded.
});
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: "swap",
    // Only small labels use mono; preloading it delayed mobile LCP (Lighthouse 2026-09-15).
    preload: false,
    // Metric-compatible fallback: without it the late swap shifted the stats
    // panel (CLS 0.047 on /projects/[slug], Lighthouse mobile 2026-09-15).
    adjustFontFallback: true,
    fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

// The Vercel scripts 404 (and log console errors) off-Vercel; only mount them where they work.
const ON_VERCEL = Boolean(process.env.VERCEL);

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "meta" });
    return {
        metadataBase: new URL(site.url),
        title: { default: t("title"), template: `%s · ${site.name}` },
        description: t("description"),
        applicationName: site.name,
        authors: [{ name: site.fullName, url: site.url }],
        creator: site.fullName,
        keywords: t("keywords").split(","),
        alternates: localeAlternates(locale, "/"),
        openGraph: {
            type: "website",
            siteName: site.name,
            title: t("title"),
            description: t("description"),
            url: site.url,
            locale: locale === "ro" ? "ro_RO" : "en_US",
        },
        twitter: { card: "summary_large_image", title: t("title"), description: t("description") },
        robots: { index: true, follow: true },
        // src/app/icon.png is picked up automatically; apple icon from /public.
        icons: { apple: "/apple-icon.png" },
    };
}

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: dark)", color: "oklch(0.13 0.02 272)" },
        { media: "(prefers-color-scheme: light)", color: "oklch(0.985 0.005 80)" },
    ],
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
};

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) notFound();

    // Theme attributes are stamped pre-paint by THEME_INIT_SCRIPT (localStorage → cookie → system),
    // so the shell stays statically prerenderable. Defaults below are only a no-JS fallback.
    const theme = DEFAULT_THEME;

    return (
        <html
            lang={locale}
            data-mode="dark"
            data-accent={theme.accent}
            data-surface={theme.surface}
            suppressHydrationWarning
            className={`${geistSans.variable} ${geistMono.variable}`}
        >
            <head>
                <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
            </head>
            <body className="noise-overlay page-mesh antialiased">
                <NextIntlClientProvider>
                    <ThemeProvider initial={theme}>
                        <NuqsAdapter>
                            <SkipLink />
                            <Header />
                            <main id="main" className={`relative ${HEADER_OFFSET_CLASS}`}>
                                {children}
                            </main>
                            <Footer />
                        </NuqsAdapter>
                    </ThemeProvider>
                </NextIntlClientProvider>
                <PersonJsonLd />
                <WebSiteJsonLd locale={locale} />
                {ON_VERCEL ? (
                    <>
                        <Analytics />
                        <SpeedInsights />
                    </>
                ) : null}
            </body>
        </html>
    );
}
