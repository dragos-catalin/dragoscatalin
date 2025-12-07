"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import toast from "react-hot-toast";
import { Template, TemplateLanguage, TemplateType, TemplateStatus } from "@/types/templates";
import Link from "next/link";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    type?: TemplateType;
    language?: TemplateLanguage;
    status?: TemplateStatus;
    search?: string;
  }>({});

  useEffect(() => {
    const q = query(collection(db, "templates"), orderBy("updatedAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const items: Template[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          type: data.type,
          name: data.name,
          language: data.language,
          status: data.status,
          description: data.description,
          content: data.content,
          tags: data.tags,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          createdBy: data.createdBy,
        });
      });
      setTemplates(items);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Ești sigur că vrei să ștergi template-ul "${name}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "templates", id));
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Eroare la ștergere. Te rog încearcă din nou.");
    }
  };

  const handleDuplicate = async (template: Template) => {
    if (!confirm(`Duplică template-ul "${template.name}"?`)) {
      return;
    }

    try {
      const user = auth.currentUser;
      await addDoc(collection(db, "templates"), {
        name: `${template.name} (copie)`,
        type: template.type,
        language: template.language,
        status: "draft",
        description: template.description,
        content: template.content,
        tags: template.tags,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: user?.uid ?? null,
      });
    } catch (error) {
      console.error("Error duplicating template:", error);
      alert("Eroare la duplicare. Te rog încearcă din nou.");
    }
  };

  const handleActivate = async (id: string, name: string) => {
    try {
      await updateDoc(doc(db, "templates", id), {
        status: "active",
        updatedAt: Date.now(),
      });
      toast.success(`Template-ul "${name}" a fost activat!`);
    } catch (error) {
      console.error("Error activating template:", error);
      toast.error("Eroare la activare. Te rog încearcă din nou.");
    }
  };

  const filteredTemplates = templates.filter((template) => {
    if (filter.type && template.type !== filter.type) return false;
    if (filter.language && template.language !== filter.language) return false;
    if (filter.status && template.status !== filter.status) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        template.name.toLowerCase().includes(searchLower) ||
        template.description?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getTypeLabel = (type: TemplateType) => {
    switch (type) {
      case "contract": return "Contract";
      case "email": return "Email";
      case "form": return "Formular";
      default: return type;
    }
  };

  const getStatusColor = (status: TemplateStatus) => {
    switch (status) {
      case "active": return "text-green-400 border-green-400/30 bg-green-400/10";
      case "draft": return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
      case "archived": return "text-neutral-500 border-neutral-500/30 bg-neutral-500/10";
      default: return "text-neutral-400 border-neutral-400/30 bg-neutral-400/10";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Template-uri</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Gestionează template-uri pentru formulare, contracte și email-uri
          </p>
        </div>
        <Link
          href="/dashboard/templates/new"
          className="inline-flex items-center px-4 py-2 text-sm rounded bg-white text-black hover:bg-neutral-200 transition-colors"
        >
          + Creează template
        </Link>
      </div>

      {/* Filters */}
      <div className="border border-neutral-800 rounded-lg p-4">
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          <div className="space-y-2">
            <label className="block text-neutral-400">Tip</label>
            <select
              value={filter.type || ""}
              onChange={(e) => setFilter({ ...filter, type: e.target.value as TemplateType || undefined })}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-neutral-100 focus:outline-none focus:border-neutral-600"
            >
              <option value="">Toate</option>
              <option value="contract">Contract</option>
              <option value="email">Email</option>
              <option value="form">Formular</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-neutral-400">Limbă</label>
            <select
              value={filter.language || ""}
              onChange={(e) => setFilter({ ...filter, language: e.target.value as TemplateLanguage || undefined })}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-neutral-100 focus:outline-none focus:border-neutral-600"
            >
              <option value="">Toate</option>
              <option value="ro">Română</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-neutral-400">Status</label>
            <select
              value={filter.status || ""}
              onChange={(e) => setFilter({ ...filter, status: e.target.value as TemplateStatus || undefined })}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-neutral-100 focus:outline-none focus:border-neutral-600"
            >
              <option value="">Toate</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Arhivate</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-neutral-400">Căutare</label>
            <input
              type="text"
              value={filter.search || ""}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              placeholder="Nume sau descriere..."
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
            />
          </div>
        </div>
      </div>

      {/* Templates List */}
      <div className="border border-neutral-800 rounded-lg">
        {loading ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            Se încarcă template-urile...
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-neutral-500 mb-4">
              {templates.length === 0
                ? "Nu există template-uri create încă."
                : "Nu s-au găsit template-uri cu filtrele selectate."}
            </p>
            {templates.length === 0 && (
              <Link
                href="/dashboard/templates/new"
                className="inline-flex items-center px-4 py-2 text-sm rounded bg-white text-black hover:bg-neutral-200 transition-colors"
              >
                Creează primul template
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="p-4 hover:bg-neutral-900/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-neutral-100">
                        {template.name}
                      </h3>
                      <span className="text-xs text-neutral-500">
                        · {getTypeLabel(template.type)}
                      </span>
                      <span className="text-xs uppercase px-2 py-0.5 rounded border border-neutral-700 text-neutral-400">
                        {template.language}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(template.status)}`}>
                        {template.status}
                      </span>
                    </div>

                    {template.description && (
                      <p className="text-sm text-neutral-400 mb-2">
                        {template.description}
                      </p>
                    )}

                    <div className="text-xs text-neutral-600">
                      Actualizat: {new Date(template.updatedAt).toLocaleDateString("ro-RO", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/templates/${template.id}/edit`}
                      className="px-3 py-1 text-xs rounded border border-neutral-700 hover:bg-neutral-800 transition-colors"
                    >
                      Editează
                    </Link>
                    {template.status === "draft" && (
                      <button
                        onClick={() => handleActivate(template.id, template.name)}
                        className="px-3 py-1 text-xs rounded border border-neutral-700 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400 transition-colors"
                        title="Activează template"
                      >
                        Activează
                      </button>
                    )}
                    <button
                      onClick={() => handleDuplicate(template)}
                      className="px-3 py-1 text-xs rounded border border-neutral-700 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 transition-colors"
                      title="Duplică template"
                    >
                      Duplică
                    </button>
                    <button
                      onClick={() => handleDelete(template.id, template.name)}
                      className="px-3 py-1 text-xs rounded border border-neutral-700 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors"
                    >
                      Șterge
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="border border-neutral-800 rounded-lg p-4">
          <div className="text-sm text-neutral-400">Total template-uri</div>
          <div className="text-2xl font-semibold mt-1">{templates.length}</div>
        </div>
        <div className="border border-neutral-800 rounded-lg p-4">
          <div className="text-sm text-neutral-400">Active</div>
          <div className="text-2xl font-semibold mt-1">
            {templates.filter(t => t.status === "active").length}
          </div>
        </div>
        <div className="border border-neutral-800 rounded-lg p-4">
          <div className="text-sm text-neutral-400">Draft</div>
          <div className="text-2xl font-semibold mt-1">
            {templates.filter(t => t.status === "draft").length}
          </div>
        </div>
        <div className="border border-neutral-800 rounded-lg p-4">
          <div className="text-sm text-neutral-400">Arhivate</div>
          <div className="text-2xl font-semibold mt-1">
            {templates.filter(t => t.status === "archived").length}
          </div>
        </div>
      </div>
    </div>
  );
}
