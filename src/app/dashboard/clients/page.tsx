"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, getDocs, where, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Client } from "@/types/clients";
import { FormResponse, ClientLink } from "@/types/client-links";
import ClientModal from "@/components/ClientModal";
import ClientDetailsModal from "@/components/ClientDetailsModal";
import toast from "react-hot-toast";
import { generateContractPDF, downloadPDF } from "@/lib/pdfGenerator";
import { AdminSignature } from "@/types/contracts";

type TabType = "clients" | "submissions";

export default function ClientsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("clients");
  
  // Clients tab state
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [showClientModal, setShowClientModal] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Submissions tab state
  const [submissions, setSubmissions] = useState<FormResponse[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [submissionSearchTerm, setSubmissionSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<FormResponse | null>(null);
  const [linkMappings, setLinkMappings] = useState<Record<string, ClientLink>>({});

  // Load clients
  useEffect(() => {
    const q = query(collection(db, "clients"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const items: Client[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
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
      });
      setClients(items);
      setClientsLoading(false);
    });

    return () => unsub();
  }, []);

  // Load submissions
  useEffect(() => {
    const q = query(collection(db, "formResponses"), orderBy("submittedAt", "desc"));

    const unsub = onSnapshot(q, async (snap) => {
      const items: FormResponse[] = [];
      const linkIds = new Set<string>();
      
      snap.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          linkId: data.linkId,
          type: data.type,
          templateId: data.templateId,
          answers: data.answers,
          submittedAt: data.submittedAt,
          // Contract signature fields
          clientSignature: data.clientSignature,
          contractHtml: data.contractHtml,
          contractHash: data.contractHash,
          status: data.status,
        });
        if (data.linkId) {
          linkIds.add(data.linkId);
        }
      });
      
      // Load link mappings for all submissions
      const mappings: Record<string, ClientLink> = {};
      for (const linkId of linkIds) {
        try {
          const linkSnap = await getDoc(doc(db, "clientLinks", linkId));
          if (linkSnap.exists()) {
            const linkData = linkSnap.data();
            mappings[linkId] = {
              id: linkSnap.id,
              name: linkData.name,
              type: linkData.type,
              clientFieldMapping: linkData.clientFieldMapping,
              clientName: linkData.clientName,
              clientEmail: linkData.clientEmail,
              createdAt: linkData.createdAt,
              createdBy: linkData.createdBy,
              status: linkData.status,
            } as ClientLink;
          }
        } catch (err) {
          console.error("Error loading link mapping:", err);
        }
      }
      
      setLinkMappings(mappings);
      setSubmissions(items);
      setSubmissionsLoading(false);
    });

    return () => unsub();
  }, []);

  // Client functions
  const handleDeleteClient = async (client: Client) => {
    // Check for assigned links
    const linksQuery = query(
      collection(db, "clientLinks"),
      where("clientId", "==", client.id)
    );
    const linksSnap = await getDocs(linksQuery);
    
    const linkCount = linksSnap.size;
    const confirmMessage = linkCount > 0
      ? `Acest client are ${linkCount} link-uri asociate. Acestea vor fi dezalocate. Sigur vrei să ștergi clientul "${client.name}"?`
      : `Sigur vrei să ștergi clientul "${client.name}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      // Unlink all associated links
      if (linkCount > 0) {
        const batch = linksSnap.docs.map((linkDoc) =>
          updateDoc(doc(db, "clientLinks", linkDoc.id), {
            clientId: null,
          })
        );
        await Promise.all(batch);
      }

      // Delete client
      await deleteDoc(doc(db, "clients", client.id));
      toast.success(`Clientul "${client.name}" a fost șters!`);
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Eroare la ștergere. Te rog încearcă din nou.");
    }
  };

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowClientModal(true);
    setShowClientDetails(false);
  };

  const handleCreateClient = () => {
    setEditingClient(null);
    setShowClientModal(true);
  };

  const handleCloseClientModal = () => {
    setShowClientModal(false);
    setEditingClient(null);
  };

  // Submission functions
  const handleDeleteSubmission = async (submission: FormResponse) => {
    if (!confirm("Ștergi această submisie?")) return;

    try {
      await deleteDoc(doc(db, "formResponses", submission.id));
      toast.success("Submisie ștearsă cu succes!");
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast.error("Eroare la ștergere. Te rog încearcă din nou.");
    }
  };
  const handleDownloadContractPDF = async (submission: FormResponse) => {
    try {
      const link = linkMappings[submission.linkId];
      
      // If PDF URL exists, download the stored PDF directly
      if (submission.pdfUrl) {
        const anchor = document.createElement('a');
        anchor.href = submission.pdfUrl;
        anchor.download = `${link?.name || "contract"}.pdf`;
        anchor.target = '_blank';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        toast.success("PDF descărcat cu succes!");
        return;
      }
      
      // Fallback: Generate PDF if no stored version exists (for old submissions)
      if (!submission.contractHtml) {
        toast.error("Nu există contract disponibil pentru descărcare.");
        return;
      }
      
      let htmlForPdf = submission.contractHtml;
      
      // Add admin signature if available
      const adminSignature = link?.contractData?.adminSignature;
      if (adminSignature && adminSignature.signatureData) {
        const adminSignatureHtml = generateAdminSignatureHtml(adminSignature);
        htmlForPdf = `${htmlForPdf}${adminSignatureHtml}`;
      }

      // Add client signature if available
      if (submission.clientSignature) {
        const clientSignatureHtml = generateClientSignatureHtml({
          method: submission.clientSignature.method,
          value: submission.clientSignature.value || submission.clientSignature.fileUrl || '',
          signerName: link?.clientName || "Client",
          signedAt: new Date(submission.clientSignature.signedAt)
        });
        htmlForPdf = `${htmlForPdf}${clientSignatureHtml}`;
      }
      
      const pdf = await generateContractPDF(htmlForPdf, link?.name || "contract");
      downloadPDF(pdf, `${link?.name || "contract"}.pdf`);
      toast.success("PDF descărcat cu succes!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Eroare la descărcarea PDF-ului.");
    }
  };

  const generateAdminSignatureHtml = (adminSignature: AdminSignature): string => {
    const timestamp = new Date(adminSignature.signedAt || 0).toLocaleString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let signatureContent = '';
    
    if (adminSignature.type === "simple") {
      if (adminSignature.signatureMethod === "typed") {
        signatureContent = `<p style="font-size: 32px; font-family: 'Brush Script MT', cursive; color: #000; margin: 0;">${adminSignature.signatureData}</p>`;
      } else if (adminSignature.signatureMethod === "drawn") {
        signatureContent = `<img src="${adminSignature.signatureData}" style="max-height: 120px; width: auto;" alt="Signature" />`;
      }
    } else if (adminSignature.type === "digital-certificate") {
      signatureContent = `<div style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background-color: #dcfce7; color: #166534; border-radius: 8px; font-weight: 500;">
        <span style="font-size: 20px;">🛡️</span>
        <span>Semnat digital cu certificat</span>
      </div>`;
    }

    return `
      <div style="margin-top: 40px; padding-top: 24px; border-top: 2px solid #444;">
        <p style="font-size: 12px; color: #666; margin-bottom: 8px;">Semnat de Administrator:</p>
        <div style="background-color: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
          ${signatureContent}
        </div>
        <div style="font-size: 13px; color: #666;">
          <p style="margin: 4px 0;"><strong>Semnat de:</strong> ${adminSignature.signedBy}</p>
          <p style="margin: 4px 0;"><strong>Data:</strong> ${timestamp}</p>
        </div>
      </div>
    `;
  };

  const generateClientSignatureHtml = (signature: {
    method: "typed" | "drawn" | "uploaded";
    value: string;
    signerName: string;
    signedAt: Date;
  }): string => {
    const timestamp = signature.signedAt.toLocaleString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let signatureContent = '';
    
    if (signature.method === "typed") {
      signatureContent = `<p style="font-size: 32px; font-family: 'Brush Script MT', cursive; color: #000; margin: 0;">${signature.value}</p>`;
    } else if (signature.method === "drawn") {
      signatureContent = `<img src="${signature.value}" style="max-height: 120px; width: auto;" alt="Signature" />`;
    } else if (signature.method === "uploaded") {
      signatureContent = `<div style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background-color: #dcfce7; color: #166534; border-radius: 8px; font-weight: 500;">
        <span style="font-size: 20px;">📄</span>
        <span>Semnat prin PDF încărcat</span>
      </div>`;
    }

    return `
      <div style="margin-top: 20px; padding-top: 24px; border-top: 2px solid #444;">
        <p style="font-size: 12px; color: #666; margin-bottom: 8px;">Semnat de Client:</p>
        <div style="background-color: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
          ${signatureContent}
        </div>
        <div style="font-size: 13px; color: #666;">
          <p style="margin: 4px 0;"><strong>Semnat de:</strong> ${signature.signerName}</p>
          <p style="margin: 4px 0;"><strong>Data:</strong> ${timestamp}</p>
        </div>
      </div>
    `;
  };
  const getClientName = (submission: FormResponse): string => {
    const link = linkMappings[submission.linkId];
    
    // For contract signatures, use the link's clientName
    if (submission.type === "contract-signature" && link?.clientName) {
      return link.clientName;
    }
    
    const answers = submission.answers;
    
    // Safety check for undefined answers
    if (!answers || typeof answers !== 'object') {
      // Fallback to link's clientName if available
      return link?.clientName || "Client necunoscut";
    }
    
    // First try to use field mapping if available
    if (link?.clientFieldMapping) {
      const mapping = link.clientFieldMapping;
      // Find which form field is mapped to "name"
      const nameFormField = Object.keys(mapping).find(key => mapping[key] === "name");
      if (nameFormField && answers[nameFormField]) {
        return String(answers[nameFormField]);
      }
    }
    
    // Fallback to common field names
    const nameFields = ['clientName', 'name', 'nume', 'companyName', 'businessName'];
    for (const field of nameFields) {
      if (answers[field]) return String(answers[field]);
    }
    
    // Final fallback to link's clientName
    return link?.clientName || "Client necunoscut";
  };

  const getClientEmail = (submission: FormResponse): string | null => {
    const link = linkMappings[submission.linkId];
    
    // For contract signatures, use the link's clientEmail
    if (submission.type === "contract-signature" && link?.clientEmail) {
      return link.clientEmail;
    }
    
    const answers = submission.answers;
    
    // Safety check for undefined answers
    if (!answers || typeof answers !== 'object') {
      // Fallback to link's clientEmail if available
      return link?.clientEmail || null;
    }
    
    // First try to use field mapping if available
    if (link?.clientFieldMapping) {
      const mapping = link.clientFieldMapping;
      // Find which form field is mapped to "email"
      const emailFormField = Object.keys(mapping).find(key => mapping[key] === "email");
      if (emailFormField && answers[emailFormField]) {
        return String(answers[emailFormField]);
      }
    }
    
    // Fallback to common field names
    const emailFields = ['clientEmail', 'email', 'contactEmail'];
    for (const field of emailFields) {
      if (answers[field]) return String(answers[field]);
    }
    
    // Final fallback to link's clientEmail
    return link?.clientEmail || null;
  };

  // Filtered data
  const filteredClients = clients.filter((client) => {
    if (clientSearchTerm === "") return true;
    const searchLower = clientSearchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.company?.toLowerCase().includes(searchLower) ||
      false
    );
  });

  const filteredSubmissions = submissions.filter((submission) => {
    if (submissionSearchTerm === "") return true;
    const clientName = getClientName(submission).toLowerCase();
    const clientEmail = getClientEmail(submission)?.toLowerCase() || "";
    return clientName.includes(submissionSearchTerm.toLowerCase()) || clientEmail.includes(submissionSearchTerm.toLowerCase());
  });

  // Stats
  const clientsWithLinks = clients.filter(async (client) => {
    const q = query(collection(db, "clientLinks"), where("clientId", "==", client.id));
    const snap = await getDocs(q);
    return snap.size > 0;
  }).length;

  const recentClients = clients.filter(
    c => Date.now() - c.createdAt < 7 * 24 * 60 * 60 * 1000
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Clienți & Submisii</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Gestionează clienții și vizualizează formularele completate
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-800">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("clients")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "clients"
                ? "border-white text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Clienți ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "submissions"
                ? "border-white text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Submisii ({submissions.length})
          </button>
        </div>
      </div>

      {/* Clients Tab */}
      {activeTab === "clients" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="border border-neutral-800 rounded-lg p-4">
              <div className="text-2xl font-semibold">{clients.length}</div>
              <div className="text-xs text-neutral-500 mt-1">Total clienți</div>
            </div>
            <div className="border border-neutral-800 rounded-lg p-4">
              <div className="text-2xl font-semibold text-blue-400">{recentClients}</div>
              <div className="text-xs text-neutral-500 mt-1">Această săptămână</div>
            </div>
            <div className="border border-neutral-800 rounded-lg p-4">
              <div className="text-2xl font-semibold text-green-400">{clientsWithLinks}</div>
              <div className="text-xs text-neutral-500 mt-1">Cu link-uri</div>
            </div>
          </div>

          {/* Search & Create */}
          <div className="flex gap-3">
            <input
              type="text"
              value={clientSearchTerm}
              onChange={(e) => setClientSearchTerm(e.target.value)}
              placeholder="Caută după nume, email sau companie..."
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
            />
            <button
              onClick={handleCreateClient}
              className="px-4 py-2 text-sm rounded bg-white text-black hover:bg-neutral-200 transition-colors flex-shrink-0"
            >
              + Creează client
            </button>
          </div>

          {/* Clients List */}
          <div className="border border-neutral-800 rounded-lg overflow-hidden">
            {clientsLoading ? (
              <div className="text-center py-12 text-neutral-500 text-sm">
                Se încarcă clienții...
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-sm">
                {clientSearchTerm
                  ? "Nu s-au găsit clienți cu termenul de căutare."
                  : "Nu există clienți încă. Creează primul client!"}
              </div>
            ) : (
              <div className="divide-y divide-neutral-800">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="p-4 hover:bg-neutral-900/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-neutral-100">{client.name}</h3>
                          {client.company && (
                            <span className="text-xs text-neutral-500">· {client.company}</span>
                          )}
                        </div>

                        <div className="text-sm text-neutral-400 mb-1">
                          📧 {client.email}
                          {client.phone && <span className="ml-3">📱 {client.phone}</span>}
                        </div>

                        {client.city && (
                          <div className="text-xs text-neutral-500">
                            📍 {client.city}{client.county && `, ${client.county}`}
                          </div>
                        )}

                        <div className="text-xs text-neutral-600 mt-2">
                          Creat: {new Date(client.createdAt).toLocaleDateString("ro-RO", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs flex-shrink-0">
                        <button
                          onClick={() => handleViewDetails(client)}
                          className="px-3 py-1.5 rounded border border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600 transition-colors"
                        >
                          👁️ Vezi detalii
                        </button>
                        <button
                          onClick={() => handleEditClient(client)}
                          className="px-3 py-1.5 rounded border border-neutral-700 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 transition-colors"
                        >
                          ✏️ Editează
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client)}
                          className="px-3 py-1.5 rounded border border-neutral-700 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors"
                        >
                          🗑️ Șterge
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === "submissions" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="border border-neutral-800 rounded-lg p-4">
              <div className="text-2xl font-semibold">{submissions.length}</div>
              <div className="text-xs text-neutral-500 mt-1">Total submisii</div>
            </div>
            <div className="border border-neutral-800 rounded-lg p-4">
              <div className="text-2xl font-semibold text-blue-400">
                {submissions.filter(s => Date.now() - s.submittedAt < 7 * 24 * 60 * 60 * 1000).length}
              </div>
              <div className="text-xs text-neutral-500 mt-1">Această săptămână</div>
            </div>
            <div className="border border-neutral-800 rounded-lg p-4">
              <div className="text-2xl font-semibold text-green-400">
                {submissions.filter(s => Date.now() - s.submittedAt < 24 * 60 * 60 * 1000).length}
              </div>
              <div className="text-xs text-neutral-500 mt-1">Astăzi</div>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            value={submissionSearchTerm}
            onChange={(e) => setSubmissionSearchTerm(e.target.value)}
            placeholder="Caută după nume sau email..."
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
          />

          {/* Submissions List */}
          <div className="border border-neutral-800 rounded-lg overflow-hidden">
            {submissionsLoading ? (
              <div className="text-center py-12 text-neutral-500 text-sm">
                Se încarcă submisiile...
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-sm">
                {submissionSearchTerm
                  ? "Nu s-au găsit submisii cu termenul de căutare."
                  : "Nu există submisii încă."}
              </div>
            ) : (
              <div className="divide-y divide-neutral-800">
                {filteredSubmissions.map((submission) => {
                  const clientName = getClientName(submission);
                  const clientEmail = getClientEmail(submission);

                  return (
                    <div
                      key={submission.id}
                      className="p-4 hover:bg-neutral-900/50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-neutral-100">{clientName}</h3>
                          </div>

                          {clientEmail && (
                            <div className="text-sm text-neutral-400 mb-2">
                              📧 {clientEmail}
                            </div>
                          )}

                          <div className="text-xs text-neutral-500 mb-2">
                            Trimis: {new Date(submission.submittedAt).toLocaleDateString("ro-RO", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>

                          <div className="text-xs text-neutral-600">
                            {submission.answers && typeof submission.answers === 'object' 
                              ? Object.keys(submission.answers).length 
                              : 0} câmpuri completate
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs flex-shrink-0">
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="px-3 py-1.5 rounded border border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600 transition-colors"
                          >
                            👁️ Vezi detalii
                          </button>
                          <button
                            onClick={() => handleDeleteSubmission(submission)}
                            className="px-3 py-1.5 rounded border border-neutral-700 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors"
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
      )}

      {/* Client Modal (Create/Edit) */}
      <ClientModal
        isOpen={showClientModal}
        onClose={handleCloseClientModal}
        mode={editingClient ? "edit" : "create"}
        clientId={editingClient?.id}
        initialData={editingClient ? {
          name: editingClient.name,
          email: editingClient.email,
          phone: editingClient.phone,
          company: editingClient.company,
          cui: editingClient.cui,
          address: editingClient.address,
          city: editingClient.city,
          county: editingClient.county,
          postalCode: editingClient.postalCode,
          notes: editingClient.notes,
        } : undefined}
        onClientUpdated={() => {
          // Refresh happens automatically via onSnapshot
        }}
      />

      {/* Client Details Modal */}
      {selectedClient && (
        <ClientDetailsModal
          isOpen={showClientDetails}
          onClose={() => {
            setShowClientDetails(false);
            setSelectedClient(null);
          }}
          client={selectedClient}
          onEdit={() => handleEditClient(selectedClient)}
        />
      )}

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-950 border border-neutral-800 rounded-lg p-6">
            <button
              onClick={() => setSelectedSubmission(null)}
              className="absolute top-4 right-4 px-4 py-2 text-sm rounded border border-neutral-700 hover:bg-neutral-800 transition-colors"
            >
              ✕ Închide
            </button>

            <h2 className="text-lg font-semibold mb-4">
              Detalii submisie - {getClientName(selectedSubmission)}
            </h2>

            <div className="space-y-4">
              <div className="border-b border-neutral-800 pb-2">
                <div className="text-xs text-neutral-500">Data submisie</div>
                <div className="text-sm text-neutral-200">
                  {new Date(selectedSubmission.submittedAt).toLocaleString("ro-RO", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="border-b border-neutral-800 pb-2">
                <div className="text-xs text-neutral-500">Tip submisie</div>
                <div className="text-sm text-neutral-200">
                  {selectedSubmission.type === "contract-signature" ? "Semnătură contract" :
                   selectedSubmission.type === "project-intake" ? "Intake proiect" :
                   selectedSubmission.type === "discovery" ? "Discovery" :
                   selectedSubmission.type === "contract-data" ? "Date contract" : selectedSubmission.type}
                </div>
              </div>

              {/* Contract Signature Details */}
              {selectedSubmission.type === "contract-signature" && selectedSubmission.clientSignature && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-200 mb-3">Detalii semnătură</h3>
                  <div className="space-y-3">
                    <div className="border border-neutral-800 rounded-lg p-3">
                      <div className="text-xs text-neutral-500 mb-1">Metodă semnătură</div>
                      <div className="text-sm text-neutral-200">
                        {selectedSubmission.clientSignature.method === "typed" ? "Scris la tastatură" :
                         selectedSubmission.clientSignature.method === "drawn" ? "Desenat" :
                         selectedSubmission.clientSignature.method === "uploaded" ? "PDF încărcat" : selectedSubmission.clientSignature.method}
                      </div>
                    </div>
                    
                    <div className="border border-neutral-800 rounded-lg p-3">
                      <div className="text-xs text-neutral-500 mb-1">Data semnării</div>
                      <div className="text-sm text-neutral-200">
                        {new Date(selectedSubmission.clientSignature.signedAt).toLocaleString("ro-RO", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {selectedSubmission.clientSignature.method === "typed" && selectedSubmission.clientSignature.value && (
                      <div className="border border-neutral-800 rounded-lg p-3">
                        <div className="text-xs text-neutral-500 mb-1">Semnătură</div>
                        <div className="text-2xl font-signature text-neutral-200">
                          {selectedSubmission.clientSignature.value}
                        </div>
                      </div>
                    )}

                    {selectedSubmission.clientSignature.method === "drawn" && selectedSubmission.clientSignature.value && (
                      <div className="border border-neutral-800 rounded-lg p-3">
                        <div className="text-xs text-neutral-500 mb-2">Semnătură desenată</div>
                        <img 
                          src={selectedSubmission.clientSignature.value} 
                          alt="Signature" 
                          className="max-h-32 w-auto bg-white p-2 rounded"
                        />
                      </div>
                    )}

                    {selectedSubmission.contractHtml && (
                      <div className="border border-neutral-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs text-neutral-500">Preview contract</div>
                          <button
                            onClick={() => handleDownloadContractPDF(selectedSubmission)}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                          >
                            📥 Descarcă PDF
                          </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto bg-white p-4 rounded text-black text-sm">
                          <div dangerouslySetInnerHTML={{ __html: selectedSubmission.contractHtml }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form Answers */}
              {selectedSubmission.type !== "contract-signature" && selectedSubmission.answers && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-200 mb-3">Răspunsuri formular</h3>
                  <div className="space-y-3">
                    {Object.entries(selectedSubmission.answers).map(([key, value]) => (
                      <div key={key} className="border border-neutral-800 rounded-lg p-3">
                        <div className="text-xs text-neutral-500 mb-1">{key}</div>
                        <div className="text-sm text-neutral-200">
                          {Array.isArray(value) ? value.join(", ") : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
