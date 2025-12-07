"use client";

import { TemplateLanguage, parseFieldPlaceholders, replacePlaceholders, getSampleData } from "@/types/templates";
import DynamicFormRenderer from "./DynamicFormRenderer";

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  templateDescription?: string;
  templateContent: string;
  templateLanguage: TemplateLanguage;
}

export default function TemplatePreviewModal({
  isOpen,
  onClose,
  templateName,
  templateDescription,
  templateContent,
  templateLanguage,
}: TemplatePreviewModalProps) {
  if (!isOpen) return null;

  const parsedFields = parseFieldPlaceholders(templateContent, templateLanguage);

  // For preview, replace placeholders with sample data
  const sampleData = getSampleData();

  // First replace regular placeholders with sample data
  let previewIntroText = replacePlaceholders(templateContent, sampleData);

  // Then remove field placeholder syntax ({{type:fieldName*}})
  previewIntroText = previewIntroText.replace(/\{\{(input|email|tel|textarea|number|date|select|checkbox|radio):[^}]+\}\}/g, '');

  // Clean up extra whitespace
  previewIntroText = previewIntroText.replace(/\n{3,}/g, '\n\n').trim();

  const handlePreviewSubmit = () => {
    // No-op for preview mode
    alert(templateLanguage === "en" ? "This is preview mode only" : "Acesta este doar modul de previzualizare");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-neutral-950 rounded-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="sticky top-4 right-4 float-right z-10 px-4 py-2 text-sm rounded bg-neutral-800 hover:bg-neutral-700 transition-colors"
        >
          ✕ {templateLanguage === "en" ? "Close" : "Închide"}
        </button>

        {/* Preview content matching the actual form view */}
        <div className="min-h-screen bg-neutral-950 py-12 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Preview banner */}
            <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-3 text-sm text-blue-300">
              👁️ <strong>{templateLanguage === "en" ? "Preview Mode" : "Mod previzualizare"}</strong> -{" "}
              {templateLanguage === "en"
                ? "This is how your template will appear to users when they open the form link."
                : "Așa va arăta template-ul tău pentru utilizatori când deschid linkul de formular."}
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-neutral-100 mb-2">
                  {templateName}
                </h1>
                {templateDescription && (
                  <p className="text-sm text-neutral-400">{templateDescription}</p>
                )}
              </div>

              <DynamicFormRenderer
                fields={parsedFields}
                language={templateLanguage}
                introText={previewIntroText}
                onSubmit={handlePreviewSubmit}
                isSubmitting={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
