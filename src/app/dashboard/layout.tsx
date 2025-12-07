"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, signOutUser } from "@/lib/firebase";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

const ALLOWED_EMAIL = "vladulescu.catalin@gmail.com";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Don't apply auth check on login page
  const isLoginPage = pathname === "/dashboard/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (currentUser: User | null) => {
      if (!currentUser || currentUser.email !== ALLOWED_EMAIL) {
        setAllowed(false);
        setLoading(false);
        router.replace("/dashboard/login");
        return;
      }

      setUser(currentUser);
      setAllowed(true);
      setLoading(false);
    });

    return () => unsub();
  }, [router, isLoginPage]);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.replace("/dashboard/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // If on login page, render without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        <div className="text-sm">Verific sesiunea...</div>
      </div>
    );
  }

  if (!allowed) return null;

  return (
    <div className="min-h-screen flex bg-neutral-950 text-neutral-100">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#171717',
            color: '#fff',
            border: '1px solid #404040',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-800 p-6 space-y-6">
        <div className="space-y-2">
          <div className="font-semibold text-lg">Dragos HQ</div>
          {user && (
            <div className="text-xs text-neutral-500 truncate">
              {user.email}
            </div>
          )}
        </div>

        <nav className="space-y-1 text-sm">
          <Link
            href="/dashboard"
            className="block px-3 py-2 rounded hover:bg-neutral-900 hover:text-white transition-colors"
          >
            Overview
          </Link>
          <Link
            href="/dashboard/links"
            className="block px-3 py-2 rounded hover:bg-neutral-900 hover:text-white transition-colors"
          >
            Link-uri formulare
          </Link>
          <Link
            href="/dashboard/templates"
            className="block px-3 py-2 rounded hover:bg-neutral-900 hover:text-white transition-colors"
          >
            Template-uri
          </Link>
          <Link
            href="/dashboard/clients"
            className="block px-3 py-2 rounded hover:bg-neutral-900 hover:text-white transition-colors"
          >
            Clienți & Submisii
          </Link>
          <Link
            href="/dashboard/projects"
            className="block px-3 py-2 rounded hover:bg-neutral-900 hover:text-white transition-colors"
          >
            Proiecte & contracte
          </Link>
        </nav>

        <div className="pt-4 border-t border-neutral-800 space-y-1">
          <Link
            href="/dashboard/settings"
            className="block px-3 py-2 text-sm rounded hover:bg-neutral-900 hover:text-white transition-colors text-neutral-400"
          >
            ⚙️ Setări
          </Link>
          <Link
            href="/"
            className="block px-3 py-2 text-sm rounded hover:bg-neutral-900 hover:text-white transition-colors text-neutral-400"
          >
            ← Înapoi la site
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 text-sm rounded hover:bg-neutral-900 hover:text-white transition-colors text-neutral-400"
          >
            Deconectare
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
