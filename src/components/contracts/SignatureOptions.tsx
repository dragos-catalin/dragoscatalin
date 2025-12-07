/**
 * Signature options component with tabs for different signature methods
 */

"use client";

import { useState } from "react";
import SignatureCanvas from "./SignatureCanvas";
import PDFUpload from "./PDFUpload";

export type SignatureMethod = "typed" | "drawn" | "uploaded";

interface SignatureOptionsProps {
  linkId: string;
  onSignatureComplete: (method: SignatureMethod, value: string) => void;
  onDownloadPDF: () => void;
  isSubmitting?: boolean;
}

export default function SignatureOptions({
  linkId,
  onSignatureComplete,
  onDownloadPDF,
  isSubmitting = false
}: SignatureOptionsProps) {
  const [activeTab, setActiveTab] = useState<SignatureMethod>("typed");
  const [typedName, setTypedName] = useState("");
  const [drawnSignature, setDrawnSignature] = useState<string | null>(null);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = () => {
    if (!agreedToTerms) {
      alert("Te rog acceptă termenii semnării electronice");
      return;
    }

    switch (activeTab) {
      case "typed":
        if (!typedName.trim()) {
          alert("Te rog introdu numele tău complet");
          return;
        }
        onSignatureComplete("typed", typedName.trim());
        break;
      
      case "drawn":
        if (!drawnSignature) {
          alert("Te rog desenează semnătura ta");
          return;
        }
        onSignatureComplete("drawn", drawnSignature);
        break;
      
      case "uploaded":
        if (!uploadedPdfUrl) {
          alert("Te rog încarcă contractul semnat");
          return;
        }
        onSignatureComplete("uploaded", uploadedPdfUrl);
        break;
    }
  };

  const isValid = () => {
    if (!agreedToTerms) return false;
    
    switch (activeTab) {
      case "typed":
        return typedName.trim().length > 0;
      case "drawn":
        return drawnSignature !== null;
      case "uploaded":
        return uploadedPdfUrl !== null;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-neutral-800">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("typed")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "typed"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Tastează Numele
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("drawn")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "drawn"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Desenează Semnătura
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("uploaded")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "uploaded"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Încarcă PDF Semnat
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === "typed" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Numele tău complet *
              </label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Ex: Ion Popescu"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            {typedName && (
              <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-400 mb-2">Previzualizare semnătură:</p>
                <p className="text-3xl font-signature text-neutral-100">
                  {typedName}
                </p>
              </div>
            )}
            <p className="text-xs text-neutral-500">
              Tastând numele tău aici, confirmi că accepți termenii acestui contract.
            </p>
          </div>
        )}

        {activeTab === "drawn" && (
          <div className="space-y-4">
            <SignatureCanvas
              onSignatureChange={setDrawnSignature}
              width={600}
              height={200}
            />
            <p className="text-xs text-neutral-500">
              Desenează semnătura ta în căsuța de mai sus folosind mouse-ul sau degetul.
            </p>
          </div>
        )}

        {activeTab === "uploaded" && (
          <PDFUpload
            linkId={linkId}
            onUploadComplete={setUploadedPdfUrl}
            onDownloadPDF={onDownloadPDF}
          />
        )}
      </div>

      {/* Terms Agreement */}
      <div className="border-t border-neutral-800 pt-6 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-neutral-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 bg-neutral-900"
          />
          <span className="text-sm text-neutral-300 group-hover:text-neutral-100">
            Sunt de acord să semnez acest contract electronic. Înțeleg că semnătura mea electronică are 
            aceeași valoare juridică ca și o semnătură olografă și că accept termenii și condițiile 
            din acest contract.
          </span>
        </label>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid() || isSubmitting}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Se procesează...
            </>
          ) : (
            'Semnează Contractul'
          )}
        </button>
      </div>
    </div>
  );
}
