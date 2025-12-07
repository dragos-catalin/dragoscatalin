/**
 * Preview component for filled contract
 */

"use client";

import { replacePlaceholdersInContract } from "@/lib/contractHelpers";

interface ContractPreviewProps {
  templateContent: string;
  placeholderValues: Record<string, string>;
  className?: string;
}

export default function ContractPreview({
  templateContent,
  placeholderValues,
  className = ""
}: ContractPreviewProps) {
  // Replace all placeholders with values
  const filledContent = replacePlaceholdersInContract(templateContent, placeholderValues);

  // Remove any remaining unreplaced placeholders for preview
  const cleanContent = filledContent.replace(/\{\{[^}]+\}\}/g, '<span class="text-yellow-400 bg-yellow-400/10 px-1 rounded">[Lipsă]</span>');

  return (
    <div className={`border border-neutral-800 rounded-lg p-6 bg-neutral-900/50 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-200">
          Previzualizare Contract
        </h3>
        <span className="text-xs text-neutral-500">
          Aceasta este o previzualizare a contractului completat
        </span>
      </div>

      <div
        className="prose prose-invert max-w-none text-neutral-300 prose-headings:text-neutral-100 prose-p:text-neutral-300 prose-strong:text-neutral-100 prose-ul:text-neutral-300 prose-ol:text-neutral-300"
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />
    </div>
  );
}
