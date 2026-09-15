import { ImageResponse } from "next/og";
import en from "../../../messages/en.json";
import ro from "../../../messages/ro.json";
import { OG, OgFrame } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — full-stack developer & builder`;
export const size = OG.size;
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const m = locale === "ro" ? ro : en;

    return new ImageResponse(
        <OgFrame blob={{ width: 520, height: 520, right: -120, top: -160, background: OG.accent }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 760 }}>
                <div
                    style={{
                        fontSize: 28,
                        color: OG.accent,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                    }}
                >
                    {m.hero.eyebrow}
                </div>
                <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1, letterSpacing: -3 }}>
                    {site.name}
                </div>
                <div style={{ fontSize: 36, color: OG.muted, lineHeight: 1.3 }}>{m.hero.title}</div>
            </div>
        </OgFrame>,
        { ...size },
    );
}
