import type { Metadata } from "next";
import { EditorialHome } from "@/skins/editorial/EditorialHome";
import { skinHomeMetadata } from "@/skins/shared/metadata";

export function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    return skinHomeMetadata(params);
}

export default function EditorialPage() {
    return <EditorialHome />;
}
