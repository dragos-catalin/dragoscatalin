import { Header, Hero, Projects, ContactForm, Footer } from "@/components/ui";

export default function Home() {
    return (
        <div className="relative min-h-screen">
            {/* Subtle mesh gradient background */}
            <div className="fixed inset-0 -z-10 bg-background" />
            <div className="fixed inset-0 -z-10 bg-gradient-to-br from-violet-500/[0.03] via-transparent to-fuchsia-500/[0.03] dark:from-violet-500/[0.05] dark:via-transparent dark:to-fuchsia-500/[0.03]" />

            {/* Subtle radial glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-violet-400/[0.07] to-transparent dark:from-violet-500/[0.04] rounded-full blur-3xl -z-10" />

            <Header />
            <main>
                <Hero />
                <Projects />
                <ContactForm />
            </main>
            <Footer />
        </div>
    );
}
