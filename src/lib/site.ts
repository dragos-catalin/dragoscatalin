export const site = {
    name: "Dragos Catalin",
    fullName: "Dragos Catalin Vladulescu",
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
    brands: [
        { name: "codai", url: "https://codai.ro" },
        { name: "Brivio", url: "https://brivio.ro" },
        { name: "StudiAI", url: "https://studiai.ro" },
        { name: "MixAI", url: "https://mixai.ro" },
        { name: "notai", url: "https://notai.ro" },
    ],
} as const;

export type SocialKey = keyof typeof site.socials;
