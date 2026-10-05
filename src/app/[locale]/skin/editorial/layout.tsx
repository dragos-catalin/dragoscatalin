import { EditorialChrome } from "@/skins/editorial/EditorialChrome";
import "@/skins/editorial/editorial.css";

/** Editorial skin chrome. Reached only via the src/proxy.ts home rewrite (direct URL = 404). */
export default function EditorialLayout({ children }: { children: React.ReactNode }) {
    return <EditorialChrome>{children}</EditorialChrome>;
}
