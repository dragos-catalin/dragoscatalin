import type { Metadata } from "next";
import { DevicesHome } from "@/skins/devices/DevicesHome";
import { skinHomeMetadata } from "@/skins/shared/metadata";

export function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    return skinHomeMetadata(params);
}

export default function DevicesPage() {
    return <DevicesHome />;
}
