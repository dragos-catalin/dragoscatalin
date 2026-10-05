import { Header } from "@/components/layout/Header";
import { HEADER_OFFSET_CLASS } from "@/components/layout/header-offset";
import { Footer } from "@/components/layout/Footer";

/**
 * Classic chrome for the classic home and every shared content page. Skin homes live in
 * `../skin/<id>/` with their own chrome; `src/proxy.ts` rewrites `/` and `/ro` to them when
 * the `dc-skin` cookie names a non-classic skin.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main id="main" className={`relative ${HEADER_OFFSET_CLASS}`}>
                {children}
            </main>
            <Footer />
        </>
    );
}
