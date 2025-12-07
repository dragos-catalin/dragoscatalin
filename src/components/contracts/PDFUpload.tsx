/**
 * PDF upload component for uploading signed contracts
 */

"use client";

import { useState, useRef } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

interface PDFUploadProps {
  linkId: string;
  onUploadComplete: (fileUrl: string) => void;
  onDownloadPDF: () => void;
}

export default function PDFUpload({
  linkId,
  onUploadComplete,
  onDownloadPDF
}: PDFUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      alert("Te rog încarcă un fișier PDF");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Fișierul este prea mare. Dimensiunea maximă este 10MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create storage reference
      const timestamp = Date.now();
      const fileName = `contracts/${linkId}/signed_${timestamp}.pdf`;
      const storageRef = ref(storage, fileName);

      // Upload file with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error("Upload error:", error);
          alert("Eroare la încărcare. Te rog încearcă din nou.");
          setUploading(false);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadedFileUrl(downloadURL);
          setUploading(false);
          onUploadComplete(downloadURL);
        }
      );
    } catch (error) {
      console.error("Upload error:", error);
      alert("Eroare la încărcare. Te rog încearcă din nou.");
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Step 1: Download PDF */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-neutral-200">
          Pasul 1: Descarcă contractul
        </h4>
        <button
          type="button"
          onClick={onDownloadPDF}
          className="w-full px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Descarcă PDF
        </button>
        <p className="text-xs text-neutral-500">
          Descarcă contractul, semnează-l digital cu un tool de semnare PDF (Adobe Acrobat, DocuSign, etc.)
        </p>
      </div>

      {/* Step 2: Upload signed PDF */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-neutral-200">
          Pasul 2: Încarcă contractul semnat
        </h4>

        {!uploadedFileUrl ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Se încarcă... {uploadProgress}%
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Selectează PDF semnat
                </>
              )}
            </button>
            {uploading && (
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-400">
                  Contract semnat încărcat cu succes!
                </p>
                <a
                  href={uploadedFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-300 hover:underline mt-1 inline-block"
                >
                  Vizualizează PDF încărcat
                </a>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUploadedFileUrl(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="text-xs text-neutral-400 hover:text-neutral-200"
              >
                Schimbă
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
