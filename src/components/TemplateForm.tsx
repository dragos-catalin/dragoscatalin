"use client";

import { useState, useRef } from "react";
import {
  TemplateType,
  TemplateLanguage,
  TemplateStatus,
  TEMPLATE_PLACEHOLDERS,
} from "@/types/templates";
import Link from "next/link";
import RichTextEditor, { RichTextEditorRef } from "@/components/RichTextEditor";
import TemplatePreviewModal from "@/components/TemplatePreviewModal";
import toast from "react-hot-toast";

export interface TemplateFormData {
  name: string;
  type: TemplateType;
  language: TemplateLanguage;
  status: TemplateStatus;
  description: string;
  content: string;
  tags: string;
}

interface TemplateFormProps {
  initialData?: Partial<TemplateFormData>;
  onSubmit: (data: TemplateFormData, shouldClose: boolean) => Promise<void>;
  mode: "create" | "edit";
  loading?: boolean;
}

export default function TemplateForm({
  initialData,
  onSubmit,
  mode,
  loading = false
}: TemplateFormProps) {
  const editorRef = useRef<RichTextEditorRef>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: initialData?.name || "",
    type: initialData?.type || "contract",
    language: initialData?.language || "ro",
    status: initialData?.status || "draft",
    description: initialData?.description || "",
    content: initialData?.content || "",
    tags: initialData?.tags || "",
  });
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent, shouldClose: boolean = true) => {
    e.preventDefault();

    // Prevent double submission
    if (saving) {
      return;
    }

    if (!formData.name || !formData.content) {
      toast.error("Te rog completează numele și conținutul template-ului.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(formData, shouldClose);
      if (!shouldClose) {
        toast.success("Template salvat cu succes!");
      }
    } catch (error) {
      toast.error("Eroare la salvare. Te rog încearcă din nou.");
    } finally {
      setSaving(false);
    }
  };

  const insertPlaceholder = (token: string) => {
    editorRef.current?.insertText(token);
  };

  const placeholdersByCategory = TEMPLATE_PLACEHOLDERS.reduce((acc, placeholder) => {
    if (!acc[placeholder.category]) {
      acc[placeholder.category] = [];
    }
    acc[placeholder.category].push(placeholder);
    return acc;
  }, {} as Record<string, typeof TEMPLATE_PLACEHOLDERS>);

  const categoryLabels: Record<string, string> = {
    client: "Client",
    project: "Proiect",
    contract: "Contract",
    personal: "Personal",
    system: "Sistem",
    field: "Câmpuri Formular",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-neutral-400">Se încarcă...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {mode === "create" ? "Creează Template Nou" : "Editează Template"}
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {mode === "create"
              ? "Creează un template reutilizabil pentru contracte sau email-uri"
              : "Modifică template-ul existent"}
          </p>
        </div>
        <Link
          href="/dashboard/templates"
          className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          ← Înapoi la template-uri
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-neutral-800 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-medium text-neutral-200">
              Informații de bază
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">
                  Nume template *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                  placeholder="Ex: Contract Web Development Standard"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">
                  Tip
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as TemplateType })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-neutral-600"
                >
                  <option value="contract">Contract</option>
                  <option value="form">Formular</option>
                  <option value="email">Email</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">
                  Limbă
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value as TemplateLanguage })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-neutral-600"
                >
                  <option value="ro">Română</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TemplateStatus })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-neutral-600"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Activ</option>
                  <option value="archived">Arhivat</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Descriere
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                placeholder="Descriere scurtă a template-ului..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Tag-uri (separate prin virgulă)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                placeholder="Ex: web, development, standard"
              />
            </div>
          </div>

          <div className="border border-neutral-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-200">
                Conținut template *
              </h3>
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="text-xs px-3 py-1 rounded border border-neutral-700 hover:bg-neutral-800 transition-colors"
              >
                👁️ Preview
              </button>
            </div>

            {formData.type === "form" && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded px-3 py-2 text-xs text-blue-300">
                💡 <strong>Pentru formulare:</strong> Folosește placeholder-uri de tip câmp (ex: <code className="bg-neutral-800 px-1 rounded">{"{{input:clientName*}}"}</code>, <code className="bg-neutral-800 px-1 rounded">{"{{email:contactEmail}}"}</code>) pentru a insera câmpuri de completat. Vezi panoul din dreapta pentru toate tipurile disponibile.
              </div>
            )}

            <div className="space-y-2">
              <RichTextEditor
                ref={editorRef}
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder={formData.type === "form"
                  ? "Scrie conținutul formularului aici...\n\nExemplu:\nBună! Te rog completează următoarele informații:\n\nNume: {{input:clientName*}}\nEmail: {{email:contactEmail*}}\nDescriere proiect: {{textarea:projectDescription*}}\n\nMultumesc!"
                  : "Scrie conținutul template-ului aici...\n\nFolosește placeholder-uri precum {{clientName}}, {{projectDescription}}, etc."}
              />
              <p className="text-xs text-neutral-500">
                {formData.type === "form"
                  ? "Folosește placeholder-uri de tip CÂMP pentru a insera input-uri de completat (vezi panoul din dreapta)."
                  : "Folosește placeholder-uri din panoul din dreapta pentru a insera date dinamice."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as any, false);
              }}
              disabled={saving}
              className="px-6 py-2 text-sm rounded border border-neutral-700 hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Se salvează..." : "💾 Salvează"}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-sm rounded bg-white text-black hover:bg-neutral-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Se salvează..." : mode === "create" ? "Salvează și închide" : "Actualizează și închide"}
            </button>
            <Link
              href="/dashboard/templates"
              className="px-6 py-2 text-sm rounded border border-neutral-700 hover:bg-neutral-800 transition-colors"
            >
              Anulează
            </Link>
          </div>
        </div>

        {/* Placeholders Sidebar */}
        <div className="lg:col-span-1">
          <div className="border border-neutral-800 rounded-lg p-4 sticky top-4">
            <h3 className="text-sm font-medium text-neutral-200 mb-4">
              Placeholder-uri disponibile
            </h3>

            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {Object.entries(placeholdersByCategory).map(([category, placeholders]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                    {categoryLabels[category]}
                  </h4>
                  <div className="space-y-1">
                    {placeholders.map((placeholder) => (
                      <button
                        key={placeholder.token}
                        type="button"
                        onClick={() => insertPlaceholder(placeholder.token)}
                        className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-neutral-800 transition-colors group"
                      >
                        <div className="font-mono text-neutral-300 group-hover:text-white">
                          {placeholder.token}
                        </div>
                        <div className="text-neutral-500 text-[10px] mt-0.5">
                          Ex: {placeholder.example}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      <TemplatePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        templateName={formData.name || (mode === "create" ? "Template nou" : "Template")}
        templateDescription={formData.description}
        templateContent={formData.content}
        templateLanguage={formData.language}
      />
    </div>
  );
}
