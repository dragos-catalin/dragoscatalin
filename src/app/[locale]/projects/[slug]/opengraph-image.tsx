import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import en from "../../../../../messages/en.json";
import ro from "../../../../../messages/ro.json";
import { getProject, projects } from "@/data/projects";
import { OG, OgFrame, ogFonts } from "@/lib/og";
import { routing } from "@/i18n/routing";

export const alt = "Project cover";
export const size = OG.size;
export const contentType = "image/png";

export function generateStaticParams() {
    return routing.locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export default async function ProjectOgImage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale, slug } = await params;
    const project = getProject(slug);
    if (!project) notFound();

    const lang = locale === "ro" ? "ro" : "en";
    const m = lang === "ro" ? ro : en;
    const statusLabel = m.projects.status[project.status];
    const hue = project.hue ?? 270;

    return new ImageResponse(
        <OgFrame
            blob={{
                right: 60,
                top: 0,
                background: `hsl(${hue} 60% 40%)`,
            }}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 800 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24 }}>
                    <span
                        style={{
                            padding: "6px 16px",
                            borderRadius: 9999,
                            border: `2px solid ${OG.accent}`,
                            color: OG.accentText,
                            fontWeight: 500,
                            display: "flex",
                        }}
                    >
                        {statusLabel}
                    </span>
                    <span style={{ color: OG.muted }}>
                        {project.years.from}–{project.years.to ?? "now"}
                    </span>
                </div>
                <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1, letterSpacing: -3 }}>
                    {project.name}
                </div>
                <div style={{ fontSize: 34, fontWeight: 500, color: OG.muted, lineHeight: 1.3 }}>
                    {project.tagline[lang]}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
                    {project.stack.slice(0, 6).map((s) => (
                        <span
                            key={s}
                            style={{
                                padding: "6px 14px",
                                borderRadius: 10,
                                background: "rgba(235,238,245,0.08)",
                                fontWeight: 500,
                                border: `1px solid ${OG.line}`,
                                fontSize: 22,
                                display: "flex",
                            }}
                        >
                            {s}
                        </span>
                    ))}
                </div>
            </div>
        </OgFrame>,
        { ...size, fonts: await ogFonts() },
    );
}
