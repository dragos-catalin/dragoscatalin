import { Header, Hero, Projects, ContactForm, Footer } from "@/components/ui";

export default function Home() {
    return (
        <div className="relative min-h-screen">
            {/* Unified continuous background for entire page */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black" />

            {/* Animated gradient orbs */}
            <div className="fixed top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-gray-200/30 dark:from-gray-800/40 dark:to-gray-700/40 rounded-full blur-3xl -z-10" />
            <div className="fixed top-1/2 left-0 w-96 h-96 bg-gradient-to-tr from-gray-200/30 to-blue-200/30 dark:from-gray-700/40 dark:to-gray-800/40 rounded-full blur-3xl -z-10" />
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-300/20 to-gray-300/20 dark:from-gray-800/40 dark:to-gray-900/40 rounded-full blur-3xl -z-10" />

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
