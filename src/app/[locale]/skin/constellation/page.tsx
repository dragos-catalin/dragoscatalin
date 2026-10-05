import type { Metadata } from "next";
import { ConstellationHome } from "@/skins/constellation/ConstellationHome";
import { skinHomeMetadata } from "@/skins/shared/metadata";

export function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    return skinHomeMetadata(params);
}

export default function ConstellationPage() {
    return <ConstellationHome />;
}
