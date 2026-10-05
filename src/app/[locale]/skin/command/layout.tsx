import { CommandChrome } from "@/skins/command/CommandChrome";
import "@/skins/command/command.css";

/** Command skin chrome. Reached only via the src/proxy.ts home rewrite (direct URL = 404). */
export default function CommandLayout({ children }: { children: React.ReactNode }) {
    return <CommandChrome>{children}</CommandChrome>;
}
