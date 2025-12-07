"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, addDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { ClientLink } from "@/types/client-links";
import Link from "next/link";
import toast from "react-hot-toast";

const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://dragoscatalin.ro";

export default function LinksPage() {
  const [links, setLinks] = useState<ClientLink[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "clientLinks"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const items: ClientLink[]= [];
      snap.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          name: data.name || `Link ${doc.id.substring(0, 6)}`,
          type: data.type,
          templateId: data.templateId,
          preFillData: data.preFillData,
          clientFieldMapping: data.clientFieldMapping,
          clientId: data.clientId,
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          note: data.note,
          expiresInDays: data.expiresInDays,
          expiresAt: data.expiresAt,
          createdAt: data.createdAt,
          createdBy: data.createdBy,
          status: data.status,
          completedAt: data.completedAt,
        });
      });
      setLinks(items);
    });

    return () => unsub();
  }, []);

  const handleDelete = async (link: ClientLink) => {
    if (!confirm(`Ștergi link-ul "${link.name}"?`)) return;

    try {
      await deleteDoc(doc(db, "clientLinks", link.id));
      toast.success("Link șters cu succes!");
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("Eroare la ștergere. Te rog încearcă din nou.");
    }
  };

  const handleDuplicate = async (link: ClientLink) => {
    const user = auth.currentUser;
    
    try {
      const now = Date.now();
      const expiresAt = link.expiresInDays && link.expiresInDays > 0
        ? now + (link.expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      await addDoc(collection(db, "clientLinks"), {
        name: `${link.name} (copie)`,
        type: link.type,
        templateId: link.templateId || null,
        preFillData: link.preFillData || null,
        clientFieldMapping: link.clientFieldMapping || null,
        clientId: link.clientId || null,
        clientName: link.clientName || null,
        clientEmail: link.clientEmail || null,
        note: link.note || null,
        expiresInDays: link.expiresInDays !== undefined ? link.expiresInDays : 1,
        expiresAt: expiresAt,
        createdAt: now,
        createdBy: user?.uid ?? null,
        status: "pending",
        completedAt: null,
      });

      toast.success("Link duplicat cu succes!");
    } catch (error) {
      console.error("Error duplicating link:", error);
      toast.error("Eroare la duplicare. Te rog încearcă din nou.");
    }
  };

  const getPublicUrl = (id: string) => `${PUBLIC_BASE_URL}/form/${id}`;
  const getDevUrl = (id: string) => `http://localhost:24789/form/${id}`;
  const isDevelopment = process.env.NODE_ENV === 'development';

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(url);
      toast.success("Link copiat în clipboard!");
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (e) {
      console.error("Copy failed:", e);
      toast.error("Eroare la copiere. Încearcă manual.");
    }
  };

  const filteredLinks = links.filter((link) => {
    const matchesStatus = statusFilter === "all" || link.status === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: links.length,
    pending: links.filter((l) => l.status === "pending").length,
    completed: links.filter((l) => l.status === "completed").length,
    expired: links.filter((l) => l.status === "expired").length,
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Link-uri formulare</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Generează și gestionează link-uri personalizate pentru clienți
          </p>
        </div>
        <Link
          href="/dashboard/links/new"
          className="inline-flex items-center px-4 py-2 text-sm rounded bg-white text-black hover:bg-neutral-200 transition-colors"
        >
          + Creează link nou
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-neutral-800 rounded-lg p-4">
          <div className="text-2xl font-semibold">{stats.total}</div>
          <div className="text-xs text-neutral-500 mt-1">Total link-uri</div>
        </div>
        <div className="border border-neutral-800 rounded-lg p-4">
          <div className="text-2xl font-semibold text-yellow-400">{stats.pending}</div>
          <div className="text-xs text-neutral-500 mt-1">Pending</div>
        </div>
        <div className="border border-neutral-800 rounded-lg p-4">
          <div className="text-2xl font-semibold text-green-400">{stats.completed}</div>
          <div className="text-xs text-neutral-500 mt-1">Completate</div>
        </div>
        <div className="border border-neutral-800 rounded-lg p-4">
          <div className="text-2xl font-semibold text-red-400">{stats.expired}</div>
          <div className="text-xs text-neutral-500 mt-1">Expirate</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Caută după nume, client..."
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-600"
        >
          <option value="all">Toate statusurile</option>
          <option value="pending">Pending</option>
          <option value="completed">Completate</option>
          <option value="expired">Expirate</option>
        </select>
      </div>

      {/* Links List */}
      <div className="border border-neutral-800 rounded-lg overflow-hidden">
        {filteredLinks.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 text-sm">
            {searchTerm || statusFilter !== "all"
              ? "Nu s-au găsit link-uri cu filtrele selectate."
              : "Nu există link-uri create încă. Creează primul link!"}
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {filteredLinks.map((link) => {
              const productionUrl = getPublicUrl(link.id);
              const devUrl = getDevUrl(link.id);
              return (
                <div
                  key={link.id}
                  className="p-4 hover:bg-neutral-900/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-neutral-100">{link.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(link.status)}`}>
                          {link.status}
                        </span>
                      </div>

                      {link.clientName && (
                        <div className="text-sm text-neutral-400 mb-1">
                          Client: {link.clientName}
                          {link.clientEmail && ` (${link.clientEmail})`}
                        </div>
                      )}

                      <div className="space-y-1 mb-2">
                        <div 
                          onClick={() => copyToClipboard(productionUrl)}
                          className="text-xs text-neutral-500 font-mono bg-neutral-900/50 px-2 py-1 rounded truncate cursor-pointer hover:bg-neutral-800 transition-colors"
                          title="Click pentru a copia"
                        >
                          <span className="text-neutral-600 text-[10px] mr-1">PROD:</span>
                          {productionUrl}
                          {copySuccess === productionUrl && <span className="ml-2 text-green-400">✓ Copiat</span>}
                        </div>
                        {isDevelopment && (
                          <div 
                            onClick={() => copyToClipboard(devUrl)}
                            className="text-xs text-neutral-500 font-mono bg-neutral-900/50 px-2 py-1 rounded truncate cursor-pointer hover:bg-neutral-800 transition-colors"
                            title="Click pentru a copia"
                          >
                            <span className="text-neutral-600 text-[10px] mr-1">LOCAL:</span>
                            {devUrl}
                            {copySuccess === devUrl && <span className="ml-2 text-green-400">✓ Copiat</span>}
                          </div>
                        )}
                      </div>

                      {link.note && (
                        <div className="text-xs text-neutral-500 mb-2">
                          📝 {link.note}
                        </div>
                      )}

                      <div className="text-[11px] text-neutral-600">
                        Creat: {new Date(link.createdAt).toLocaleDateString("ro-RO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {link.expiresAt && (
                          <> · Expiră: {new Date(link.expiresAt).toLocaleDateString("ro-RO", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })} ({link.expiresInDays} zile)</>
                        )}
                        {link.completedAt && (
                          <> · Completat: {new Date(link.completedAt).toLocaleDateString("ro-RO", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}</>
                        )}
                        {Object.keys(link.preFillData || {}).length > 0 && (
                          <> · {Object.keys(link.preFillData || {}).length} câmp pre-completat</>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs flex-shrink-0">
                      <button
                        onClick={() => copyToClipboard(productionUrl)}
                        className="px-3 py-1.5 rounded border border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600 transition-colors"
                        title="Copiază link production"
                      >
                        {copySuccess === productionUrl ? "✓ Copiat" : "📋 Copy"}
                      </button>
                      <button
                        onClick={() => handleDuplicate(link)}
                        className="px-3 py-1.5 rounded border border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600 transition-colors"
                        title="Duplică link"
                      >
                        📑 Duplică
                      </button>
                      <Link
                        href={`/dashboard/links/${link.id}/edit`}
                        className="px-3 py-1.5 rounded border border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600 transition-colors"
                        title="Editează link"
                      >
                        ✏️ Editează
                      </Link>
                      <button
                        onClick={() => handleDelete(link)}
                        className="px-3 py-1.5 rounded border border-neutral-700 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors"
                        title="Șterge link"
                      >
                        🗑️ Șterge
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
