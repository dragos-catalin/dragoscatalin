"use client";

import { useState, useEffect } from "react";
import { LinkStatus } from "@/types/client-links";
import { Template, parseFieldPlaceholders, FormField } from "@/types/templates";
import { Client, ClientFormData } from "@/types/clients";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { UserProfile } from "@/types/user-profile";
import Link from "next/link";
import TemplatePreviewModal from "@/components/TemplatePreviewModal";
import RichTextEditor from "@/components/RichTextEditor";
import ClientModal from "@/components/ClientModal";
import ContractPlaceholderForm from "@/components/contracts/ContractPlaceholderForm";
import ContractPreview from "@/components/contracts/ContractPreview";
import SignatureCanvas from "@/components/contracts/SignatureCanvas";
import { replacePlaceholdersInContract, generateContractHash } from "@/lib/contractHelpers";
import { ContractLinkData, AdminSignature } from "@/types/contracts";
import { generateContractPDFWithSignatureBoxes, verifyUploadedPDF } from "@/lib/pdf/contractPdfWithSignatureBoxes";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import toast from "react-hot-toast";

export interface LinkFormData {
  name: string;
  templateId: string;
  preFillData: Record<string, any>;
  clientFieldMapping?: Record<string, string>;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  note?: string;
  expiresInDays?: number;
  status: LinkStatus;
  // Contract-specific fields
  contractData?: ContractLinkData;
}

interface LinkFormProps {
  initialData?: Partial<LinkFormData>;
  onSubmit: (data: LinkFormData, shouldClose: boolean) => Promise<void>;
  mode: "create" | "edit";
  loading?: boolean;
  linkId?: string; // For edit mode
}

export default function LinkForm({
  initialData,
  onSubmit,
  mode,
  loading = false,
  linkId
}: LinkFormProps) {
  const [formData, setFormData] = useState<LinkFormData>({
    name: initialData?.name || "",
    templateId: initialData?.templateId || "",
    preFillData: initialData?.preFillData || {},
    clientFieldMapping: initialData?.clientFieldMapping || {},
    clientId: initialData?.clientId || "",
    clientName: initialData?.clientName || "",
    clientEmail: initialData?.clientEmail || "",
    note: initialData?.note || "",
    expiresInDays: initialData?.expiresInDays !== undefined ? initialData.expiresInDays : 1,
    status: initialData?.status || "pending",
  });

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [parsedFields, setParsedFields] = useState<FormField[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [saving, setSaving] = useState(false);
  const [contractPlaceholderValues, setContractPlaceholderValues] = useState<Record<string, string>>(
    initialData?.contractData?.contractData || {}
  );
  const [showContractPreview, setShowContractPreview] = useState(false);
  const [adminSignedPdfUrl, setAdminSignedPdfUrl] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [savedLinkId, setSavedLinkId] = useState<string | undefined>(linkId); // Track if link is saved

  // Quick signature states
  const [signatureMode, setSignatureMode] = useState<"quick" | "certificate">("quick");
  const [quickSignMethod, setQuickSignMethod] = useState<"typed" | "drawn">("typed");
  const [typedSignature, setTypedSignature] = useState("");
  const [drawnSignature, setDrawnSignature] = useState<string | null>(null);

  // Update savedLinkId when linkId prop changes (after parent creates link)
  useEffect(() => {
    if (linkId) {
      setSavedLinkId(linkId);
    }
  }, [linkId]);

  // Load user profile for digital signature
  useEffect(() => {
    const loadUserProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docRef = doc(db, "userProfiles", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    };

    loadUserProfile();
  }, []);

  // Initialize signature states from saved data (for edit mode)
  useEffect(() => {
    if (initialData?.contractData?.adminSignature) {
      const adminSig = initialData.contractData.adminSignature;

      if (adminSig.type === "simple") {
        // Quick signature
        setSignatureMode("quick");

        if (adminSig.signatureMethod === "typed" && adminSig.signatureData) {
          setQuickSignMethod("typed");
          setTypedSignature(adminSig.signatureData);
        } else if (adminSig.signatureMethod === "drawn" && adminSig.signatureData) {
          setQuickSignMethod("drawn");
          setDrawnSignature(adminSig.signatureData);
        }
      } else if (adminSig.type === "digital-certificate" && adminSig.signatureData) {
        // Certificate signature
        setSignatureMode("certificate");
        setAdminSignedPdfUrl(adminSig.signatureData);
      }
    }
  }, [initialData]);

  // Load all active templates (both form and contract)
  useEffect(() => {
    const q = query(
      collection(db, "templates"),
      where("status", "==", "active")
    );

    const unsub = onSnapshot(q, (snap) => {
      const items: Template[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          type: data.type,
          name: data.name,
          language: data.language,
          status: data.status,
          content: data.content,
          description: data.description,
          tags: data.tags,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          createdBy: data.createdBy,
        });
      });
      setTemplates(items);
    });

    return () => unsub();
  }, []);

  // Load clients
  useEffect(() => {
    const q = query(collection(db, "clients"), orderBy("name", "asc"));

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
    });

    return () => unsub();
  }, []);

  // Load selected template and parse fields
  useEffect(() => {
    if (formData.templateId) {
      const template = templates.find(t => t.id === formData.templateId);
      if (template) {
        setSelectedTemplate(template);

        // Only parse fields for form templates
        if (template.type === "form") {
          const fields = parseFieldPlaceholders(template.content, template.language);
          setParsedFields(fields);
        } else {
          setParsedFields([]);
        }
      }
    } else {
      setSelectedTemplate(null);
      setParsedFields([]);
    }
  }, [formData.templateId, templates]);

  // Handle admin digital certificate signing
  const handleDownloadPdfForSigning = async () => {
    if (!selectedTemplate || selectedTemplate.type !== "contract") {
      toast.error("Doar contractele pot fi descărcate.");
      return;
    }

    if (!savedLinkId) {
      toast.error("Salvează link-ul mai întâi pentru a descărca PDF-ul.");
      return;
    }

    setIsDownloadingPdf(true);
    try {
      // Fetch saved link data from Firestore
      const linkDoc = await getDoc(doc(db, "clientLinks", savedLinkId));
      if (!linkDoc.exists()) {
        toast.error("Link-ul nu a fost găsit în baza de date.");
        return;
      }

      const linkData = linkDoc.data();
      const savedContractData = linkData.contractData as ContractLinkData;

      if (!savedContractData || !savedContractData.contractData) {
        toast.error("Nu există date de contract salvate.");
        return;
      }

      // Generate contract HTML from saved data
      const contractHtml = replacePlaceholdersInContract(
        selectedTemplate.content,
        savedContractData.contractData
      );

      // Create contract data object with HTML
      const contractData: ContractLinkData = {
        templateId: formData.templateId,
        contractData: savedContractData.contractData,
        contractHtml: contractHtml,
        contractCode: savedContractData.contractCode || `CONTRACT-${Date.now()}`,
        linkName: formData.name,
        clauses: savedContractData.clauses || [],
      };

      // Generate PDF with signature boxes
      const pdfBytes = await generateContractPDFWithSignatureBoxes(contractData);

      // Download PDF
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formData.name.replace(/\s+/g, '_')}_pentru_semnare.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('PDF descărcat! Semnează-l cu certificatul digital și încarcă-l înapoi.');
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Eroare la generarea PDF-ului.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Handle signed PDF upload
  const handleSignedPdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingPdf(true);
    try {
      // Verify PDF is valid
      const verification = await verifyUploadedPDF(file);
      if (!verification.valid) {
        toast.error(verification.error || 'PDF invalid');
        return;
      }

      // Upload to Firebase Storage
      const fileName = `admin-signed-${Date.now()}.pdf`;
      const fileRef = storageRef(storage, `contracts/temp/${fileName}`);
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);

      setAdminSignedPdfUrl(downloadUrl);
      toast.success('PDF semnat încărcat cu succes!');
    } catch (error) {
      console.error('Error uploading signed PDF:', error);
      toast.error('Eroare la încărcarea PDF-ului semnat.');
    } finally {
      setIsUploadingPdf(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent, shouldClose: boolean = true) => {
    e.preventDefault();

    // Prevent double submission
    if (saving) {
      return;
    }

    if (!formData.name || !formData.templateId) {
      toast.error("Te rog completează numele link-ului și selectează un template.");
      return;
    }

    // For contract templates, generate contract data
    if (selectedTemplate?.type === "contract") {
      const contractHtml = replacePlaceholdersInContract(
        selectedTemplate.content,
        contractPlaceholderValues
      );

      const contractHash = await generateContractHash(contractHtml);

      const contractData: ContractLinkData = {
        templateId: formData.templateId,
        contractData: contractPlaceholderValues,
        contractHtml: contractHtml,
        contractHash: contractHash,
      };

      // Include admin signature based on mode
      if (signatureMode === "quick") {
        // Quick signature (typed or drawn)
        const hasQuickSignature = quickSignMethod === "typed"
          ? typedSignature.trim().length > 0
          : drawnSignature !== null;

        if (hasQuickSignature) {
          contractData.adminSignature = {
            type: "simple",
            signedBy: userProfile?.name || typedSignature || "Administrator",
            signedAt: Date.now(),
            signatureMethod: quickSignMethod,
            signatureData: quickSignMethod === "typed" ? typedSignature : drawnSignature || "",
          };
        }
      } else if (adminSignedPdfUrl) {
        // Certificate signature (PDF upload)
        contractData.adminSignature = {
          type: "digital-certificate",
          signedBy: userProfile?.name || "Administrator",
          signedAt: Date.now(),
          signatureData: adminSignedPdfUrl, // Store PDF URL
        };
      }

      formData.contractData = contractData;
    }

    setSaving(true);
    try {
      const result = await onSubmit(formData, shouldClose);
      if (!shouldClose) {
        toast.success("Link salvat cu succes!");
        // Note: linkId will be set by parent component callback
      }
    } catch (error) {
      toast.error("Eroare la salvare. Te rog încearcă din nou.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreFillChange = (fieldName: string, value: any) => {
    setFormData({
      ...formData,
      preFillData: {
        ...formData.preFillData,
        [fieldName]: value
      }
    });
  };

  const clearPreFill = (fieldName: string) => {
    const newPreFillData = { ...formData.preFillData };
    delete newPreFillData[fieldName];
    setFormData({ ...formData, preFillData: newPreFillData });
  };

  const handleClientSelect = (clientId: string) => {
    if (!clientId) {
      setFormData({ ...formData, clientId: "", clientName: "", clientEmail: "" });
      return;
    }

    const client = clients.find(c => c.id === clientId);
    if (client) {
      setFormData({
        ...formData,
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
      });
    }
  };

  const handleClientCreated = (clientId: string, clientData: ClientFormData) => {
    setFormData({
      ...formData,
      clientId: clientId,
      clientName: clientData.name,
      clientEmail: clientData.email,
    });
  };

  const handleFieldMappingChange = (formFieldName: string, clientFieldName: string) => {
    const newMapping = { ...formData.clientFieldMapping };
    if (clientFieldName === "") {
      delete newMapping[formFieldName];
    } else {
      newMapping[formFieldName] = clientFieldName;
    }
    setFormData({ ...formData, clientFieldMapping: newMapping });
  };

  // Auto-suggest field mappings based on common patterns
  const autoMapField = (formFieldName: string): string => {
    const lowerName = formFieldName.toLowerCase();

    // Name patterns
    if (lowerName.includes("nume") || lowerName.includes("name")) return "name";

    // Email patterns
    if (lowerName.includes("email") || lowerName.includes("e-mail")) return "email";

    // Phone patterns
    if (lowerName.includes("telefon") || lowerName.includes("phone") || lowerName.includes("tel")) return "phone";

    // Company patterns
    if (lowerName.includes("compan") || lowerName.includes("firm") || lowerName.includes("business")) return "company";

    // CUI patterns
    if (lowerName.includes("cui") || lowerName.includes("fiscal") || lowerName.includes("tax")) return "CUI";

    // Address patterns
    if (lowerName.includes("adres") || lowerName.includes("address") || lowerName.includes("strada")) return "address";

    // City patterns
    if (lowerName.includes("oras") || lowerName.includes("city") || lowerName.includes("localitate")) return "city";

    // County patterns
    if (lowerName.includes("judet") || lowerName.includes("county")) return "county";

    // Postal code patterns
    if (lowerName.includes("postal") || lowerName.includes("cod postal") || lowerName.includes("zip")) return "postalCode";

    // Notes patterns
    if (lowerName.includes("note") || lowerName.includes("observat") || lowerName.includes("mentiune")) return "notes";

    return "";
  };

  // Apply auto-mapping when template changes
  useEffect(() => {
    if (parsedFields.length > 0 && Object.keys(formData.clientFieldMapping || {}).length === 0) {
      const autoMapping: Record<string, string> = {};
      parsedFields.forEach(field => {
        const suggestion = autoMapField(field.name);
        if (suggestion) {
          autoMapping[field.name] = suggestion;
        }
      });
      if (Object.keys(autoMapping).length > 0) {
        setFormData({ ...formData, clientFieldMapping: autoMapping });
      }
    }
  }, [parsedFields]);

  const clientFieldOptions = [
    { value: "", label: "-- Nu mapează --" },
    { value: "name", label: "Nume *" },
    { value: "email", label: "Email *" },
    { value: "phone", label: "Telefon" },
    { value: "company", label: "Companie" },
    { value: "CUI", label: "CUI" },
    { value: "address", label: "Adresă" },
    { value: "city", label: "Oraș" },
    { value: "county", label: "Județ" },
    { value: "postalCode", label: "Cod poștal" },
    { value: "notes", label: "Note" },
  ];

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
            {mode === "create" ? "Creează Link Nou" : "Editează Link"}
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {mode === "create"
              ? "Creează un link personalizat pentru formulare clienți"
              : "Modifică setările link-ului existent"}
          </p>
        </div>
        <Link
          href="/dashboard/links"
          className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          ← Înapoi la link-uri
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="border border-neutral-800 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-medium text-neutral-200">
              Informații de bază
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">
                  Nume link (intern) *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                  placeholder="Ex: Brief Acme Corp"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as LinkStatus })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-neutral-600"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Expirare (zile)
              </label>
              <input
                type="number"
                min="0"
                value={formData.expiresInDays !== undefined ? formData.expiresInDays : ""}
                onChange={(e) => setFormData({ ...formData, expiresInDays: e.target.value ? parseInt(e.target.value) : 1 })}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                placeholder="1"
              />
              <p className="text-xs text-neutral-500">
                Numărul de zile până când link-ul expiră (0 = niciodată).
              </p>
            </div>
          </div>

          {/* Template Selection */}
          <div className="border border-neutral-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-200">
                Template formular *
              </h3>
              {selectedTemplate && (
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="text-xs px-3 py-1 rounded border border-neutral-700 hover:bg-neutral-800 transition-colors"
                >
                  👁️ Preview template
                </button>
              )}
            </div>

            <div className="space-y-2">
              <select
                value={formData.templateId}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    templateId: e.target.value,
                    preFillData: {},
                    clientFieldMapping: {},
                    contractData: undefined
                  });
                  setContractPlaceholderValues({});
                }}
                required
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-neutral-600"
              >
                <option value="">-- Selectează template --</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.type === "form" ? "Formular" : "Contract"}) - {t.language}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500">
                Doar template-uri cu status "Activ" sunt disponibile.
              </p>
            </div>
          </div>

          {/* Client Reference */}
          <div className="border border-neutral-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-200">
                Client (opțional)
              </h3>
              <button
                type="button"
                onClick={() => setShowClientModal(true)}
                className="text-xs px-3 py-1 rounded border border-neutral-700 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400 transition-colors"
              >
                + Creează client nou
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Selectează client
              </label>
              <select
                value={formData.clientId || ""}
                onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-neutral-600"
              >
                <option value="">-- Fără client asociat --</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>

            {formData.clientId && (
              <div className="p-3 bg-neutral-900/50 border border-neutral-700 rounded-lg text-xs text-neutral-400">
                <div><strong>Nume:</strong> {formData.clientName}</div>
                <div><strong>Email:</strong> {formData.clientEmail}</div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Notițe interne
              </label>
              <textarea
                value={formData.note || ""}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={2}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                placeholder="Notițe despre acest link sau client..."
              />
            </div>
          </div>

          {/* Contract Placeholder Form - Only for contract templates */}
          {selectedTemplate && selectedTemplate.type === "contract" && (
            <>
              <div className="border border-neutral-800 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-neutral-200">
                    Completează placeholder-uri contract
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowContractPreview(!showContractPreview)}
                    className="text-xs px-3 py-1 rounded border border-neutral-700 hover:bg-neutral-800 transition-colors"
                  >
                    {showContractPreview ? "Ascunde previzualizare" : "👁️ Arată previzualizare"}
                  </button>
                </div>

                <ContractPlaceholderForm
                  templateContent={selectedTemplate.content}
                  selectedClient={formData.clientId ? clients.find(c => c.id === formData.clientId) : undefined}
                  onChange={setContractPlaceholderValues}
                  initialValues={contractPlaceholderValues}
                />
              </div>

              {showContractPreview && (
                <div className="border border-neutral-800 rounded-lg p-6">
                  <ContractPreview
                    templateContent={selectedTemplate.content}
                    placeholderValues={contractPlaceholderValues}
                  />
                </div>
              )}

              {/* Admin Digital Signature Section */}
              <div className="border border-neutral-800 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-200 mb-1">
                    🔒 Semnătură Administrator
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Alegeți modul de semnare al contractului înainte de a-l trimite clientului.
                    {userProfile?.name ? (
                      <span className="text-neutral-400"> Veți semna ca: <strong className="text-neutral-300">{userProfile.name}</strong></span>
                    ) : (
                      <span className="text-yellow-400"> Completați numele în Setări pentru a putea semna.</span>
                    )}
                  </p>
                </div>

                {/* Signature Mode Selection */}
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-neutral-300 mb-2">
                    Metodă de Semnare
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSignatureMode("quick")}
                      className={`p-4 rounded-lg border-2 transition-all ${signatureMode === "quick"
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-neutral-700 hover:border-neutral-600"
                        }`}
                    >
                      <div className="text-center space-y-1">
                        <div className="text-2xl">✍️</div>
                        <div className="text-sm font-medium text-neutral-200">Semnare Rapidă</div>
                        <div className="text-xs text-neutral-500">Scrie sau desenează</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSignatureMode("certificate")}
                      className={`p-4 rounded-lg border-2 transition-all ${signatureMode === "certificate"
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-neutral-700 hover:border-neutral-600"
                        }`}
                    >
                      <div className="text-center space-y-1">
                        <div className="text-2xl">🔐</div>
                        <div className="text-sm font-medium text-neutral-200">Certificat Digital</div>
                        <div className="text-xs text-neutral-500">Smart card/USB</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Quick Signature UI */}
                {signatureMode === "quick" && (
                  <div className="space-y-4 border-t border-neutral-800 pt-4">
                    {/* Quick Sign Method Tabs */}
                    <div className="flex gap-2 border-b border-neutral-800">
                      <button
                        type="button"
                        onClick={() => setQuickSignMethod("typed")}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${quickSignMethod === "typed"
                            ? "border-blue-500 text-blue-400"
                            : "border-transparent text-neutral-400 hover:text-neutral-200"
                          }`}
                      >
                        Scrie Numele
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickSignMethod("drawn")}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${quickSignMethod === "drawn"
                            ? "border-blue-500 text-blue-400"
                            : "border-transparent text-neutral-400 hover:text-neutral-200"
                          }`}
                      >
                        Desenează Semnătura
                      </button>
                    </div>

                    {/* Typed Signature */}
                    {quickSignMethod === "typed" && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-neutral-300">
                          Numele tău complet
                        </label>
                        <input
                          type="text"
                          value={typedSignature}
                          onChange={(e) => setTypedSignature(e.target.value)}
                          placeholder="Ex: Ion Popescu"
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-blue-500"
                        />
                        {typedSignature && (
                          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
                            <p className="text-xs text-neutral-500 mb-2">Previzualizare:</p>
                            <p className="text-2xl font-signature text-neutral-100">
                              {typedSignature}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Drawn Signature */}
                    {quickSignMethod === "drawn" && (
                      <div className="space-y-3">
                        <SignatureCanvas
                          onSignatureChange={setDrawnSignature}
                          width={500}
                          height={150}
                          initialSignature={drawnSignature || undefined}
                        />
                      </div>
                    )}

                    {/* Quick Sign Status */}
                    {((quickSignMethod === "typed" && typedSignature) ||
                      (quickSignMethod === "drawn" && drawnSignature)) && (
                        <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-green-400 text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Semnătură adăugată - se va salva când salvezi contractul</span>
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Certificate Signature UI */}
                {signatureMode === "certificate" && !adminSignedPdfUrl && (
                  <div className="space-y-3 border-t border-neutral-800 pt-4">
                    {!savedLinkId && (
                      <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 text-sm text-yellow-400">
                        <strong>📝 Atenție:</strong> Salvează link-ul mai întâi pentru a descărca PDF-ul cu datele contractului.
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleDownloadPdfForSigning}
                      disabled={!savedLinkId || isDownloadingPdf}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{isDownloadingPdf ? 'Se generează PDF...' : savedLinkId ? 'Descarcă PDF pentru semnare' : 'Salvează mai întâi link-ul'}</span>
                    </button>

                    <div className="relative">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleSignedPdfUpload}
                        disabled={isUploadingPdf}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        id="admin-pdf-upload"
                      />
                      <label
                        htmlFor="admin-pdf-upload"
                        className={`block w-full py-3 px-4 border-2 border-dashed ${isUploadingPdf ? 'border-neutral-700 bg-neutral-800' : 'border-neutral-600 hover:border-neutral-500 bg-neutral-900/50'} rounded-lg transition-colors font-medium text-sm text-center cursor-pointer`}
                      >
                        <div className="flex items-center justify-center gap-2 text-neutral-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span>{isUploadingPdf ? 'Se încarcă...' : 'Încarcă PDF semnat'}</span>
                        </div>
                      </label>
                    </div>

                    <div className="bg-neutral-900/50 rounded-lg p-3 text-xs text-neutral-400">
                      <p className="font-medium text-neutral-300 mb-1">ℹ️ Cum funcționează:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Descarcă PDF-ul cu câmpurile completate</li>
                        <li>Deschide-l în Adobe Acrobat Reader DC</li>
                        <li>Selectează Tools → Certificates → Digitally Sign</li>
                        <li>Plasează semnătura în zona marcată "SEMNĂTURA ADMINISTRATOR"</li>
                        <li>Selectează certificatul digital din smart card/USB token</li>
                        <li>Salvează PDF-ul semnat și încarcă-l înapoi aici</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Certificate Signature Status */}
                {signatureMode === "certificate" && adminSignedPdfUrl && (
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 space-y-2 border-t border-neutral-800 pt-4">
                    <div className="flex items-center gap-2 text-green-400 font-medium">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>PDF semnat încărcat</span>
                    </div>
                    <div className="text-xs text-neutral-400 space-y-1 pl-7">
                      <p><strong>URL PDF:</strong> <a href={adminSignedPdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Vezi PDF</a></p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdminSignedPdfUrl(null)}
                      className="text-xs text-red-400 hover:text-red-300 underline"
                    >
                      Șterge și încarcă altul
                    </button>
                  </div>
                )}

                <p className="text-xs text-neutral-600 italic">
                  💡 Ambele tipuri de semnături sunt valide legal. Semnarea rapidă este mai convenabilă,
                  în timp ce certificatul digital oferă o validare tehnică suplimentară.
                </p>
              </div>
            </>
          )}

          {/* Client Field Mapping - Only for form templates */}
          {selectedTemplate && selectedTemplate.type === "form" && parsedFields.length > 0 && (
            <div className="border border-neutral-800 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-neutral-200 mb-1">
                  Mapare câmpuri client
                </h3>
                <p className="text-xs text-neutral-500">
                  Mapează câmpurile formularului la câmpurile din baza de date client.
                  La submiterea formularului, un client va fi creat/actualizat automat.
                </p>
              </div>

              <div className="bg-neutral-900/50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-3 pb-2 border-b border-neutral-700">
                  <div className="text-xs font-medium text-neutral-400">Câmp formular</div>
                  <div className="text-xs font-medium text-neutral-400">Câmp client</div>
                </div>

                <div className="space-y-3">
                  {parsedFields.map((field) => {
                    const label = field.label[selectedTemplate.language];
                    const mappedValue = formData.clientFieldMapping?.[field.name] || "";

                    return (
                      <div key={field.id} className="grid grid-cols-2 gap-4 items-center">
                        <div className="text-sm text-neutral-300">
                          {label}
                          {field.required && <span className="text-yellow-400 ml-1">*</span>}
                        </div>
                        <select
                          value={mappedValue}
                          onChange={(e) => handleFieldMappingChange(field.name, e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-600"
                        >
                          {clientFieldOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>

                {(() => {
                  const hasNameMapping = Object.values(formData.clientFieldMapping || {}).includes("name");
                  const hasEmailMapping = Object.values(formData.clientFieldMapping || {}).includes("email");

                  // Get all form field names from parsed template
                  const availableFormFields = new Set(parsedFields.map(f => f.name.toLowerCase()));

                  // Check which client fields are missing placeholders in template
                  const missingPlaceholders: Array<{ field: string, label: string, suggestion: string }> = [];

                  const clientFieldsToCheck = [
                    { key: "name", label: "Nume", suggestions: ["nume", "name", "nume_complet"] },
                    { key: "email", label: "Email", suggestions: ["email", "e-mail", "adresa_email"] },
                    { key: "phone", label: "Telefon", suggestions: ["telefon", "phone", "tel"] },
                    { key: "company", label: "Companie", suggestions: ["companie", "company", "firma"] },
                    { key: "CUI", label: "CUI", suggestions: ["cui", "cod_fiscal"] },
                    { key: "address", label: "Adresă", suggestions: ["adresa", "address", "strada"] },
                    { key: "city", label: "Oraș", suggestions: ["oras", "city", "localitate"] },
                    { key: "county", label: "Județ", suggestions: ["judet", "county"] },
                    { key: "postalCode", label: "Cod poștal", suggestions: ["cod_postal", "postal_code", "zip"] },
                    { key: "notes", label: "Note", suggestions: ["note", "notes", "observatii"] }
                  ];

                  clientFieldsToCheck.forEach(({ key, label, suggestions }) => {
                    // Check if any suggestion exists in template
                    const hasMatchingField = suggestions.some(suggestion =>
                      availableFormFields.has(suggestion.toLowerCase())
                    );

                    if (!hasMatchingField) {
                      missingPlaceholders.push({
                        field: key,
                        label: label,
                        suggestion: suggestions[0] // Use first suggestion as example
                      });
                    }
                  });

                  const requiredMissing = missingPlaceholders.filter(f => f.field === "name" || f.field === "email");
                  const optionalMissing = missingPlaceholders.filter(f => f.field !== "name" && f.field !== "email");

                  if (!hasNameMapping || !hasEmailMapping || missingPlaceholders.length > 0) {
                    return (
                      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg space-y-3">
                        {(!hasNameMapping || !hasEmailMapping) && (
                          <p className="text-xs text-yellow-400">
                            ⚠️ Pentru a crea automat clienți, trebuie să mapezi câmpurile <strong>Nume</strong> și <strong>Email</strong>.
                          </p>
                        )}

                        {requiredMissing.length > 0 && (
                          <div className="text-xs text-red-300/90">
                            <div className="font-medium mb-1.5 text-red-400">⛔ Placeholder-uri obligatorii lipsă din template:</div>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              {requiredMissing.map((item) => (
                                <li key={item.field}>
                                  <strong>{item.label}</strong> - adaugă <code className="bg-neutral-900 px-1.5 py-0.5 rounded text-red-300">{item.suggestion}</code>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {optionalMissing.length > 0 && (
                          <div className="text-xs text-yellow-300/80">
                            <div className="font-medium mb-1.5">💡 Placeholder-uri opționale recomandate:</div>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              {optionalMissing.map((item) => (
                                <li key={item.field}>
                                  <strong>{item.label}</strong> - <code className="bg-neutral-900 px-1.5 py-0.5 rounded text-yellow-200">{item.suggestion}</code>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <p className="text-xs text-yellow-400/90 pt-1 border-t border-yellow-500/20">
                          📝 Editează template-ul pentru a adăuga placeholder-urile lipsă și apoi reîncarcă pagina.
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          )}

          {/* Pre-fill Configuration - Only for form templates */}
          {selectedTemplate && selectedTemplate.type === "form" && parsedFields.length > 0 && (
            <div className="border border-neutral-800 rounded-lg p-6 space-y-4">
              <h3 className="text-sm font-medium text-neutral-200">
                Pre-completare câmpuri (opțional)
              </h3>
              <p className="text-xs text-neutral-500">
                Câmpurile pre-completate vor fi doar citire pentru client. Lasă gol pentru a permite clientului să completeze.
              </p>

              <div className="space-y-4">
                {parsedFields.map((field) => {
                  const label = field.label[selectedTemplate.language];
                  const isPreFilled = field.name in formData.preFillData;

                  return (
                    <div key={field.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-neutral-300">
                          {label}
                          {field.required && <span className="text-red-400 ml-1">*</span>}
                        </label>
                        {isPreFilled && (
                          <button
                            type="button"
                            onClick={() => clearPreFill(field.name)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Șterge pre-completare
                          </button>
                        )}
                      </div>

                      {field.type === "richtext" ? (
                        <div>
                          <RichTextEditor
                            value={(formData.preFillData[field.name] as string) || ""}
                            onChange={(content) => handlePreFillChange(field.name, content)}
                            placeholder="Lasă gol pentru a permite clientului să completeze"
                          />
                        </div>
                      ) : field.type === "textarea" ? (
                        <textarea
                          value={(formData.preFillData[field.name] as string) || ""}
                          onChange={(e) => handlePreFillChange(field.name, e.target.value)}
                          rows={3}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                          placeholder="Lasă gol pentru a permite clientului să completeze"
                        />
                      ) : field.type === "select" ? (
                        <select
                          value={(formData.preFillData[field.name] as string) || ""}
                          onChange={(e) => handlePreFillChange(field.name, e.target.value || undefined)}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-neutral-600"
                        >
                          <option value="">-- Lasă gol --</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label[selectedTemplate.language]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={(formData.preFillData[field.name] as string) || ""}
                          onChange={(e) => handlePreFillChange(field.name, e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                          placeholder="Lasă gol pentru a permite clientului să completeze"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Buttons */}
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
              href="/dashboard/links"
              className="px-6 py-2 text-sm rounded border border-neutral-700 hover:bg-neutral-800 transition-colors"
            >
              Anulează
            </Link>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-1">
          <div className="border border-neutral-800 rounded-lg p-4 sticky top-4 space-y-4">
            <h3 className="text-sm font-medium text-neutral-200">
              Informații
            </h3>

            <div className="text-xs text-neutral-400 space-y-2">
              <p>
                <strong>Link-ul generat</strong> va fi partajat cu clienții pentru a completa formularul.
              </p>
              <p>
                <strong>Câmpurile pre-completate</strong> vor apărea ca fiind doar citire în formular.
              </p>
              <p>
                <strong>Clientul</strong> va vedea doar câmpurile necompletate și le va putea modifica.
              </p>
            </div>

            {selectedTemplate && (
              <div className="pt-4 border-t border-neutral-700">
                <div className="text-xs text-neutral-500">Template selectat:</div>
                <div className="text-sm text-neutral-200 mt-1">{selectedTemplate.name}</div>
                <div className="text-xs text-neutral-500 mt-1">
                  {parsedFields.length} câmp{parsedFields.length !== 1 ? 'uri' : ''}
                </div>
                <div className="text-xs text-neutral-500">
                  {Object.keys(formData.preFillData).length} pre-completat{Object.keys(formData.preFillData).length !== 1 ? 'e' : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          templateName={selectedTemplate.name}
          templateDescription={selectedTemplate.description}
          templateContent={selectedTemplate.content}
          templateLanguage={selectedTemplate.language}
        />
      )}

      {/* Client Modal */}
      <ClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        mode="create"
        onClientCreated={handleClientCreated}
      />
    </div>
  );
}
