import type { Metadata } from "next";
import { CommandHome } from "@/skins/command/CommandHome";
import { skinHomeMetadata } from "@/skins/shared/metadata";

export function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    return skinHomeMetadata(params);
}

export default function CommandPage() {
    return <CommandHome />;
}
