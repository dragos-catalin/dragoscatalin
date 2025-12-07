"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, signInWithGoogle } from "@/lib/firebase";

const ALLOWED_EMAIL = "vladulescu.catalin@gmail.com";

export default function DashboardLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already logged in
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.email === ALLOWED_EMAIL) {
        router.replace("/dashboard");
      }
    });

    return () => unsub();
  }, [router]);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = await signInWithGoogle();
      
      if (user.email !== ALLOWED_EMAIL) {
        setError("Acces interzis. Acest dashboard este privat.");
        await auth.signOut();
        return;
      }

      router.replace("/dashboard");
    } catch (err) {
      console.error("Sign in error:", err);
      setError("Eroare la autentificare. Te rog încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">
            Dragos HQ
          </h1>
          <p className="text-sm text-neutral-400">
            Panou de administrare privat
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-neutral-100">
              Autentificare
            </h2>
            <p className="text-sm text-neutral-400">
              Conectează-te cu contul Google autorizat pentru a accesa dashboard-ul.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-3 px-6 rounded-lg hover:bg-neutral-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span>Se conectează...</span>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Conectare cu Google</span>
              </>
            )}
          </button>

          <div className="text-center">
            <a
              href="/"
              className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              ← Înapoi la site
            </a>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-neutral-600">
            Acest dashboard este accesibil doar utilizatorilor autorizați.
          </p>
        </div>
      </div>
    </div>
  );
}
