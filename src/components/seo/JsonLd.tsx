import type {
    BreadcrumbList,
    Person,
    SoftwareApplication,
    Thing,
    WebSite,
    WithContext,
} from "schema-dts";
import type { Project } from "@/data/types";
import { downloadUrl, installUrl, liveWebsite, operatingSystems } from "@/lib/project-links";
import { localeUrl } from "@/lib/seo";
import { site } from "@/lib/site";

const KNOWS_ABOUT = [
    "Next.js",
    "React",
    "TypeScript",
    "Rust",
    "Tauri",
    "PostgreSQL",
    "Google Cloud",
    "AI gateways",
    "e-Factura",
];

const PERSON_ID = `${site.url}/#person`;

export function JsonLd<T extends Thing>({ data }: { data: WithContext<T> }) {
    return (
        <script
            type="application/ld+json"
            // JSON-LD must be raw JSON; escape "<" so it can never close the script tag.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
        />
    );
}

export function personJsonLd(): WithContext<Person> {
    return {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": PERSON_ID,
        name: site.fullName,
        alternateName: site.name,
        url: site.url,
        image: site.avatar,
        email: `mailto:${site.email}`,
        jobTitle: "Product engineer & founder",
        address: { "@type": "PostalAddress", addressCountry: "RO" },
        sameAs: Object.values(site.socials),
        knowsAbout: KNOWS_ABOUT,
        worksFor: [
            { "@type": "Organization", name: "codai", url: "https://codai.ro" },
            { "@type": "Organization", name: "Brivio", url: "https://brivio.ro" },
        ],
    };
}

export function PersonJsonLd() {
    return <JsonLd data={personJsonLd()} />;
}

export function webSiteJsonLd(locale: string): WithContext<WebSite> {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: site.name,
        url: localeUrl(locale, "/"),
        inLanguage: locale,
        author: { "@id": PERSON_ID },
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${site.url}/projects?q={search_term_string}`,
            },
            // schema-dts does not model "query-input"; it is required by Google's Sitelinks Search Box spec.
            ...({ "query-input": "required name=search_term_string" } as Record<string, string>),
        },
    };
}

export function WebSiteJsonLd({ locale }: { locale: string }) {
    return <JsonLd data={webSiteJsonLd(locale)} />;
}

export function softwareApplicationJsonLd(
    project: Project,
    locale: string,
): WithContext<SoftwareApplication> {
    const lang = locale === "ro" ? "ro" : "en";
    const repo = project.repos?.[0];
    const install = installUrl(project);
    const download = downloadUrl(project);
    return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: project.name,
        description: project.tagline[lang],
        url: liveWebsite(project) ?? localeUrl(locale, `/projects/${project.slug}`),
        applicationCategory:
            project.category === "library" ? "DeveloperApplication" : "WebApplication",
        operatingSystem: operatingSystems(project),
        ...(install ? { installUrl: install } : {}),
        ...(download ? { downloadUrl: download } : {}),
        author: { "@id": PERSON_ID },
        inLanguage: lang,
        keywords: project.stack.join(", "),
        ...(repo ? { codeRepository: `https://github.com/${repo.owner}/${repo.name}` } : {}),
        ...(project.cover ? { image: `${site.url}/projects/${project.cover}` } : {}),
    };
}

export function breadcrumbJsonLd(
    items: { name: string; url: string }[],
): WithContext<BreadcrumbList> {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: item.url,
        })),
    };
}
