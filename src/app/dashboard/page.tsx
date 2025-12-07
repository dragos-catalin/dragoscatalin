"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ClientLink } from "@/types/client-links";

export default function DashboardPage() {
  const [recentLinks, setRecentLinks] = useState<ClientLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "clientLinks"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsub = onSnapshot(q, (snap) => {
      const items: ClientLink[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          name: data.name || data.clientName || "Unnamed Link",
          type: data.type,
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          note: data.note,
          createdAt: data.createdAt,
          createdBy: data.createdBy,
          status: data.status,
          completedAt: data.completedAt,
        });
      });
      setRecentLinks(items);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 border-green-400/30 bg-green-400/10";
      case "expired":
        return "text-red-400 border-red-400/30 bg-red-400/10";
      default:
        return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "project-intake":
        return "Brief proiect";
      case "discovery":
        return "Discovery";
      case "contract-data":
        return "Date contract";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Bun venit în panoul de administrare
        </p>
      </div>

      {/* Recent Links */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Link-uri recente</h2>
        
        {loading ? (
          <div className="text-sm text-neutral-500">Se încarcă...</div>
        ) : recentLinks.length === 0 ? (
          <div className="border border-neutral-800 rounded-lg p-8 text-center">
            <p className="text-sm text-neutral-500">
              Nu există link-uri create încă.
            </p>
            <a
              href="/dashboard/links"
              className="inline-block mt-4 px-4 py-2 text-sm rounded bg-white text-black hover:bg-neutral-200 transition-colors"
            >
              Creează primul link
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {recentLinks.map((link) => (
              <div
                key={link.id}
                className="border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {link.clientName || "(Fără nume)"}
                      </span>
                      <span className="text-xs text-neutral-500">
                        · {getTypeLabel(link.type)}
                      </span>
                    </div>
                    {link.note && (
                      <p className="text-sm text-neutral-400 line-clamp-2">
                        {link.note}
                      </p>
                    )}
                    <div className="text-xs text-neutral-600 mt-2">
                      {new Date(link.createdAt).toLocaleDateString("ro-RO", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded border ${getStatusColor(
                        link.status
                      )}`}
                    >
                      {link.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Stats */}
      <section className="grid md:grid-cols-3 gap-4">
        <div className="border border-neutral-800 rounded-lg p-4">
          <div className="text-sm text-neutral-400">Link-uri active</div>
          <div className="text-2xl font-semibold mt-1">
            {recentLinks.filter((l) => l.status === "pending").length}
          </div>
        </div>
        <div className="border border-neutral-800 rounded-lg p-4">
          <div className="text-sm text-neutral-400">Completate</div>
          <div className="text-2xl font-semibold mt-1">
            {recentLinks.filter((l) => l.status === "completed").length}
          </div>
        </div>
        <div className="border border-neutral-800 rounded-lg p-4">
          <div className="text-sm text-neutral-400">Total link-uri</div>
          <div className="text-2xl font-semibold mt-1">{recentLinks.length}</div>
        </div>
      </section>
    </div>
  );
}
