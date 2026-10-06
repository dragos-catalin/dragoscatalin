import type { StoreId } from "@/data/types";

export const site = {
    // Public name (owner, 2026-10-05): diacritics, no family name. fullName only where the law or
    // identity linking needs it (privacy controller, JSON-LD alternateName).
    name: "Dragoș Cătălin",
    asciiName: "Dragos Catalin",
    fullName: "Dragoș Cătălin Vlădulescu",
    handle: "dragoscv",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://dragoscatalin.ro",
    email: "contact@dragoscatalin.ro",
    location: "Romania",
    avatar: "https://avatars.githubusercontent.com/u/15914392?v=4",
    githubId: 15914392,
    socials: {
        github: "https://github.com/dragoscv",
        instagram: "https://instagram.com/dragoscatalin.ro",
        tiktok: "https://tiktok.com/@nusuntnormal",
        discord: "https://studiai.ro/discord",
        npm: "https://www.npmjs.com/~dragoscatalin",
        pypi: "https://pypi.org/user/dragoscv/",
    },
    orgs: ["codai-ro", "brivio-ro", "hide-protocol", "codai-ecosystem"],
    // Product brands I own and run, each a registry slug whose site answers 200 (tested against
    // src/data/projects.ts so a paused or renamed product drops out). Kept here, not derived, because
    // client components import `site` and must not pull the whole registry into the bundle.
    brands: [
        { slug: "codai", name: "codai", url: "https://codai.ro" },
        { slug: "brivio", name: "Brivio", url: "https://brivio.ro" },
        { slug: "horae", name: "Horae", url: "https://horae.dragoscatalin.ro" },
        { slug: "studiai", name: "StudiAI", url: "https://studiai.ro" },
        { slug: "marcai", name: "MarcAI", url: "https://marcai.ro" },
    ],
    // Profile-level store pages (each answered 200 on 2026-10-07). Microsoft Store has no public
    // publisher page that lists my apps, so the two app pages stand in for it. `profile: true` =
    // a page about me as a publisher, used in Person JSON-LD sameAs.
    storeProfiles: [
        {
            store: "play",
            url: "https://play.google.com/store/apps/developer?id=Dragos+Catalin",
            profile: true,
        },
        {
            store: "ms-store",
            app: "codai",
            url: "https://apps.microsoft.com/detail/9NT1T78Q4VKM",
            profile: false,
        },
        {
            store: "ms-store",
            app: "Brivio",
            url: "https://apps.microsoft.com/detail/9P9J0P8V8FCP",
            profile: false,
        },
        {
            store: "vscode-marketplace",
            url: "https://marketplace.visualstudio.com/publishers/dragoscv",
            profile: true,
        },
    ] satisfies readonly { store: StoreId; app?: string; url: string; profile: boolean }[],
} as const;

export type SocialKey = keyof typeof site.socials;
export type StoreProfile = (typeof site.storeProfiles)[number];
