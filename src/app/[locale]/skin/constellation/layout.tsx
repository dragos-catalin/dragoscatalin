import { ConstellationChrome } from "@/skins/constellation/ConstellationChrome";
import "@/skins/constellation/constellation.css";

/** Constellation skin chrome. Reached only via the src/proxy.ts home rewrite (direct URL = 404). */
export default function ConstellationLayout({ children }: { children: React.ReactNode }) {
    return <ConstellationChrome>{children}</ConstellationChrome>;
}
