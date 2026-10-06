import { ImageResponse } from "next/og";
import en from "../../../messages/en.json";
import ro from "../../../messages/ro.json";
import { OG, OgFrame, ogFonts } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — full-stack developer & builder`;
export const size = OG.size;
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const m = locale === "ro" ? ro : en;

    return new ImageResponse(
        <OgFrame blob={{ right: 60, top: 0, background: OG.accent }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
                <div
                    style={{
                        fontSize: 26,
                        fontWeight: 500,
                        color: OG.accentText,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                    }}
                >
                    {m.hero.eyebrow}
                </div>
                <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2 }}>
                    {m.hero.title}
                </div>
            </div>
        </OgFrame>,
        { ...size, fonts: await ogFonts() },
    );
}
