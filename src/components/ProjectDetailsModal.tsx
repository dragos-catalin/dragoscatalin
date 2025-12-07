"use client";

import { ClientLink, FormResponse } from "@/types/client-links";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Client } from "@/types/clients";
import toast from "react-hot-toast";

interface ProjectDetailsModalProps {
  project: ClientLink;
  response?: FormResponse;
  onClose: () => void;
}

export default function ProjectDetailsModal({ project, response, onClose }: ProjectDetailsModalProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadClient = async () => {
      if (project.clientId) {
        setLoading(true);
        try {
          const clientDoc = await getDoc(doc(db, "clients", project.clientId));
          if (clientDoc.exists()) {
            const data = clientDoc.data();
            setClient({
              id: clientDoc.id,
              name: data.name,
              email: data.email,
              phone: data.phone,
              company: data.company,
              cui: data.cui,
              address: data.address,
              city: data.city,
              county: data.county,
              postalCode: data.postalCode,
              notes: data.notes,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              createdBy: data.createdBy,
            });
          }
        } catch (error) {
          console.error("Error loading client:", error);
        }
        setLoading(false);
      }
    };

    loadClient();
  }, [project.clientId]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "project-intake":
        return "Intake Proiect";
      case "discovery":
        return "Discovery";
      case "contract-data":
        return "Date Contract";
      case "contract":
        return "Contract";
      default:
        return type;
    }
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completat";
      case "expired":
        return "Expirat";
      default:
        return "În așteptare";
    }
  };

  const handleDownloadPDF = async () => {
    if (response?.pdfUrl) {
      // Download from stored URL
      window.open(response.pdfUrl, "_blank");
    } else {
      toast.error("PDF-ul nu este disponibil");
    }
  };

  const copyPublicUrl = async () => {
    const publicUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://dragoscatalin.ro"}/form/${project.id}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Link copiat în clipboard!");
    } catch (e) {
      toast.error("Eroare la copiere");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{project.name}</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Detalii proiect
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Info */}
          <div>
            <h3 className="text-lg font-medium mb-4">Informații proiect</h3>
            <div className="bg-neutral-800/50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-neutral-400">Tip</div>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {getTypeLabel(project.type)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400">Status</div>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400">Data creării</div>
                  <div className="mt-1 text-sm">{formatDate(project.createdAt)}</div>
                </div>
                {project.completedAt && (
                  <div>
                    <div className="text-xs text-neutral-400">Data completării</div>
                    <div className="mt-1 text-sm">{formatDate(project.completedAt)}</div>
                  </div>
                )}
                {project.expiresAt && (
                  <div>
                    <div className="text-xs text-neutral-400">Expiră la</div>
                    <div className="mt-1 text-sm">{formatDate(project.expiresAt)}</div>
                  </div>
                )}
              </div>
              {project.note && (
                <div>
                  <div className="text-xs text-neutral-400">Notă</div>
                  <div className="mt-1 text-sm">{project.note}</div>
                </div>
              )}
              {project.status === "pending" && (
                <div>
                  <div className="text-xs text-neutral-400 mb-2">Link public</div>
                  <button
                    onClick={copyPublicUrl}
                    className="text-sm text-blue-400 hover:text-blue-300 break-all text-left"
                  >
                    {`${process.env.NEXT_PUBLIC_BASE_URL || "https://dragoscatalin.ro"}/form/${project.id}`}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Client Info */}
          {(client || project.clientName) && (
            <div>
              <h3 className="text-lg font-medium mb-4">Informații client</h3>
              <div className="bg-neutral-800/50 rounded-lg p-4 space-y-3">
                {loading ? (
                  <div className="text-sm text-neutral-400">Se încarcă...</div>
                ) : client ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-neutral-400">Nume</div>
                      <div className="mt-1 text-sm">{client.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-400">Email</div>
                      <div className="mt-1 text-sm">{client.email}</div>
                    </div>
                    {client.phone && (
                      <div>
                        <div className="text-xs text-neutral-400">Telefon</div>
                        <div className="mt-1 text-sm">{client.phone}</div>
                      </div>
                    )}
                    {client.company && (
                      <div>
                        <div className="text-xs text-neutral-400">Companie</div>
                        <div className="mt-1 text-sm">{client.company}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-neutral-400">Nume</div>
                      <div className="mt-1 text-sm">{project.clientName}</div>
                    </div>
                    {project.clientEmail && (
                      <div>
                        <div className="text-xs text-neutral-400">Email</div>
                        <div className="mt-1 text-sm">{project.clientEmail}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Response */}
          {response && response.answers && (
            <div>
              <h3 className="text-lg font-medium mb-4">Răspunsuri formular</h3>
              <div className="bg-neutral-800/50 rounded-lg p-4 space-y-3">
                {Object.entries(response.answers).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-xs text-neutral-400">{key}</div>
                    <div className="mt-1 text-sm">{String(value)}</div>
                  </div>
                ))}
                <div className="pt-3 border-t border-neutral-700">
                  <div className="text-xs text-neutral-400">Data trimiterii</div>
                  <div className="mt-1 text-sm">{formatDate(response.submittedAt)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Contract Signature */}
          {response && response.clientSignature && (
            <div>
              <h3 className="text-lg font-medium mb-4">Semnătură contract</h3>
              <div className="bg-neutral-800/50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-neutral-400">Metodă semnare</div>
                    <div className="mt-1 text-sm capitalize">{response.clientSignature.method}</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400">Data semnării</div>
                    <div className="mt-1 text-sm">{formatDate(response.clientSignature.signedAt)}</div>
                  </div>
                </div>
                {response.clientSignature.value && response.clientSignature.method === "drawn" && (
                  <div>
                    <div className="text-xs text-neutral-400 mb-2">Semnătură</div>
                    <img
                      src={response.clientSignature.value}
                      alt="Semnătură"
                      className="border border-neutral-700 rounded bg-white p-2 max-w-xs"
                    />
                  </div>
                )}
                {response.pdfUrl && (
                  <div>
                    <button
                      onClick={handleDownloadPDF}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Descarcă contract semnat (PDF)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contract Data */}
          {project.contractData && (
            <div>
              <h3 className="text-lg font-medium mb-4">Date contract</h3>
              <div className="bg-neutral-800/50 rounded-lg p-4 space-y-3">
                {project.contractData.adminSignature && (
                  <div>
                    <div className="text-xs text-neutral-400">Semnătură administrator</div>
                    <div className="mt-1 text-sm">
                      Semnat la {formatDate(project.contractData.adminSignature.signedAt)}
                    </div>
                  </div>
                )}
                {project.contractData.contractHtml && (
                  <div>
                    <div className="text-xs text-neutral-400 mb-2">Preview contract</div>
                    <div
                      className="prose prose-invert max-w-none text-sm border border-neutral-700 rounded p-4 max-h-96 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: project.contractData.contractHtml }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
