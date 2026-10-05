import { DevicesChrome } from "@/skins/devices/DevicesChrome";
import "@/skins/devices/devices.css";

/** Devices skin chrome. Reached only via the src/proxy.ts home rewrite (direct URL = 404). */
export default function DevicesLayout({ children }: { children: React.ReactNode }) {
    return <DevicesChrome>{children}</DevicesChrome>;
}
