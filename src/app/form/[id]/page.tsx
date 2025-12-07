"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, updateDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { ClientLink } from "@/types/client-links";
import { Template, parseFieldPlaceholders } from "@/types/templates";
import ProjectIntakeForm from "@/components/forms/ProjectIntakeForm";
import DiscoveryForm from "@/components/forms/DiscoveryForm";
import ContractDataForm from "@/components/forms/ContractDataForm";
import DynamicFormRenderer from "@/components/DynamicFormRenderer";
import SignatureOptions from "@/components/contracts/SignatureOptions";
import { SignatureMethod, AdminSignature } from "@/types/contracts";
import { generateAndDownloadContractPDF, addSignatureToContract, generateContractPDF, downloadPDF } from "@/lib/pdfGenerator";
import { enhancePDFWithSignatures } from "@/lib/pdf/pdfEnhancer";
import type { DigitalSignature } from "@/lib/crypto/digitalSignature";
import { replacePlaceholdersInContract } from "@/lib/contractHelpers";

export default function PublicFormPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";
  const [link, setLink] = useState<ClientLink | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const loadLink = async () => {
      try {
        const snap = await getDoc(doc(db, "clientLinks", id));
        if (!snap.exists()) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const data = snap.data();
        const linkData: ClientLink = {
          id: snap.id,
          name: data.name || `Link ${snap.id}`,
          type: data.type,
          templateId: data.templateId,
          preFillData: data.preFillData,
          clientFieldMapping: data.clientFieldMapping,
          clientId: data.clientId,
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          note: data.note,
          createdAt: data.createdAt,
          createdBy: data.createdBy,
          status: data.status,
          completedAt: data.completedAt,
          expiresAt: data.expiresAt,
          expiresInDays: data.expiresInDays,
          contractData: data.contractData,
          accessPassword: data.accessPassword,
        };

        console.log("=== LINK DATA LOADED ===");
        console.log("Link ID:", snap.id);
        console.log("Link Type:", linkData.type);
        console.log("Has contractData:", !!linkData.contractData);
        if (linkData.contractData) {
          console.log("ContractData keys:", Object.keys(linkData.contractData));
          console.log("Has contractHtml:", !!linkData.contractData.contractHtml);
          console.log("ContractHtml length:", linkData.contractData.contractHtml?.length || 0);
          console.log("ContractHtml preview:", linkData.contractData.contractHtml?.substring(0, 300));
          console.log("Has placeholder data:", !!linkData.contractData.contractData);
          if (linkData.contractData.contractData) {
            console.log("Placeholder values:", linkData.contractData.contractData);
          }
        }

        setLink(linkData);

        // Load template if templateId exists
        if (data.templateId) {
          try {
            const templateSnap = await getDoc(doc(db, "templates", data.templateId));
            if (templateSnap.exists()) {
              const templateData = templateSnap.data();
              setTemplate({
                id: templateSnap.id,
                type: templateData.type,
                name: templateData.name,
                language: templateData.language,
                status: templateData.status,
                content: templateData.content,
                description: templateData.description,
                tags: templateData.tags,
                createdAt: templateData.createdAt,
                updatedAt: templateData.updatedAt,
                createdBy: templateData.createdBy,
              });
            }
          } catch (err) {
            console.error("Error loading template:", err);
          }
        }
      } catch (e) {
        console.error("Error loading link:", e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadLink();
  }, [id]);

  const handleDynamicFormSubmit = async (formData: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const now = Date.now();

      // Save form response
      await addDoc(collection(db, "formResponses"), {
        linkId: id,
        type: link?.type || "form",
        templateId: link?.templateId,
        answers: formData,
        submittedAt: now,
      });

      // Handle client creation/update based on field mapping
      let createdClientId: string | null = null;

      if (link?.clientFieldMapping && Object.keys(link.clientFieldMapping).length > 0) {
        const mapping = link.clientFieldMapping;

        // Check if required fields (name and email) are mapped
        const hasNameMapping = Object.values(mapping).includes("name");
        const hasEmailMapping = Object.values(mapping).includes("email");

        if (hasNameMapping && hasEmailMapping) {
          // Extract client data from form based on mapping
          const clientData: Record<string, any> = {
            createdAt: now,
            updatedAt: now,
            createdBy: "form-submission",
          };

          // Map form fields to client fields
          Object.entries(mapping).forEach(([formField, clientField]) => {
            if (formData[formField] !== undefined && formData[formField] !== null) {
              clientData[clientField] = formData[formField];
            }
          });

          // Only proceed if we have name and email
          if (clientData.name && clientData.email) {
            try {
              // Check if link already has a clientId (update existing)
              if (link.clientId) {
                await updateDoc(doc(db, "clients", link.clientId), {
                  ...clientData,
                  updatedAt: now,
                });
                createdClientId = link.clientId;
              } else {
                // Check if client with same email already exists
                const clientQuery = query(
                  collection(db, "clients"),
                  where("email", "==", clientData.email)
                );
                const existingClients = await getDocs(clientQuery);

                if (!existingClients.empty) {
                  // Update existing client
                  const existingClient = existingClients.docs[0];
                  await updateDoc(doc(db, "clients", existingClient.id), {
                    ...clientData,
                    updatedAt: now,
                  });
                  createdClientId = existingClient.id;
                } else {
                  // Create new client
                  const newClientRef = await addDoc(collection(db, "clients"), clientData);
                  createdClientId = newClientRef.id;
                }
              }
            } catch (clientError) {
              console.error("Error creating/updating client:", clientError);
              // Continue even if client creation fails
            }
          }
        }
      }

      // Update link status and associate client if created
      const updateData: Record<string, any> = {
        status: "completed",
        completedAt: now,
      };

      if (createdClientId && !link?.clientId) {
        updateData.clientId = createdClientId;

        // Get client data to denormalize
        try {
          const clientSnap = await getDoc(doc(db, "clients", createdClientId));
          if (clientSnap.exists()) {
            const clientData = clientSnap.data();
            updateData.clientName = clientData.name;
            updateData.clientEmail = clientData.email;
          }
        } catch (err) {
          console.error("Error fetching client data:", err);
        }
      }

      await updateDoc(doc(db, "clientLinks", id), updateData);

      // Reload to show completion message
      window.location.reload();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("A apărut o eroare la trimiterea formularului. Te rog încearcă din nou.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        <div className="text-sm">Se încarcă formularul...</div>
      </div>
    );
  }

  if (notFound || !link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-xl font-semibold text-neutral-100">
            Link invalid sau expirat
          </h1>
          <p className="text-sm text-neutral-400">
            Acest link nu mai este valabil sau nu există.
          </p>
        </div>
      </div>
    );
  }

  // Show completed message for non-contract forms
  // Contract forms need to proceed to ContractSigningPage for password verification
  if (link.status === "completed" && link.type !== "contract") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-center space-y-4">
          <div className="text-6xl">✅</div>
          <h1 className="text-xl font-semibold text-neutral-100">
            Formular deja completat
          </h1>
          <p className="text-sm text-neutral-400">
            Acest formular a fost deja completat și trimis.
          </p>
        </div>
      </div>
    );
  }

  // Check if link has expired
  if (link.expiresAt && Date.now() > link.expiresAt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-center space-y-4">
          <div className="text-6xl">⏰</div>
          <h1 className="text-xl font-semibold text-neutral-100">
            Link expirat
          </h1>
          <p className="text-sm text-neutral-400">
            Acest link a expirat la {new Date(link.expiresAt).toLocaleDateString("ro-RO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}.
          </p>
          <p className="text-sm text-neutral-500">
            Te rugăm să contactezi administratorul pentru un link nou.
          </p>
        </div>
      </div>
    );
  }

  // Handle contract signing FIRST (before template-based forms)
  if (link.type === "contract") {
    return <ContractSigningPage linkId={id} link={link} template={template} />;
  }

  // Render dynamic template-based form if template exists
  if (link.templateId && template) {
    // Parse fields from template content
    const parsedFields = parseFieldPlaceholders(template.content, template.language);

    return (
      <div className="min-h-screen bg-neutral-950 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-neutral-100 mb-2">
                {template.name}
              </h1>
              {template.description && (
                <p className="text-sm text-neutral-400">{template.description}</p>
              )}
            </div>

            <DynamicFormRenderer
              fields={parsedFields}
              language={template.language}
              introText={template.content}
              preFillData={link.preFillData}
              onSubmit={handleDynamicFormSubmit}
              isSubmitting={submitting}
            />
          </div>
        </div>
      </div>
    );
  }

  // Fallback to hardcoded forms for backward compatibility
  if (link.type === "project-intake") {
    return <ProjectIntakeForm id={id} link={link} />;
  }

  if (link.type === "discovery") {
    return <DiscoveryForm id={id} link={link} />;
  }

  if (link.type === "contract-data") {
    return <ContractDataForm id={id} link={link} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="text-center space-y-4">
        <div className="text-6xl">❌</div>
        <h1 className="text-xl font-semibold text-neutral-100">
          Tip de formular necunoscut
        </h1>
      </div>
    </div>
  );
}

// Password generation utility
function generateAccessPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars
  let password = '';
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Contract Signing Component
function ContractSigningPage({ linkId, link, template }: { linkId: string; link: ClientLink; template: Template | null }) {
  const [submitted, setSubmitted] = useState(false);
  const [contractHtml, setContractHtml] = useState<string>("");
  const [clientSignature, setClientSignature] = useState<{
    method: SignatureMethod;
    value: string;
    signerName: string;
    signedAt: Date;
  } | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check password verification on mount
  useEffect(() => {
    if (link.status === "completed" && link.accessPassword) {
      const verifiedKey = `contract_verified_${linkId}`;
      const verified = sessionStorage.getItem(verifiedKey);
      if (verified === link.accessPassword) {
        setIsVerified(true);
      }
    } else if (link.status === "completed") {
      // Completed but no password set (old contracts)
      setIsVerified(true);
    }
  }, [link.status, link.accessPassword, linkId]);

  // Generate contract HTML on mount
  useEffect(() => {
    console.log("=== CONTRACT HTML GENERATION ===");
    console.log("Has link.contractData:", !!link.contractData);
    console.log("Has link.contractData.contractHtml:", !!link.contractData?.contractHtml);
    console.log("Has template:", !!template);
    console.log("Has placeholder data:", !!link.contractData?.contractData);

    // Try to use pre-generated HTML first
    if (link.contractData?.contractHtml) {
      console.log("✓ Using pre-generated contract HTML");
      console.log("Pre-generated HTML length:", link.contractData.contractHtml.length);
      console.log("Pre-generated HTML preview:", link.contractData.contractHtml.substring(0, 500));
      setContractHtml(link.contractData.contractHtml);
    }
    // Fallback: regenerate from template and placeholder values
    else if (template && link.contractData?.contractData) {
      console.log("⚠ Regenerating contract HTML from template and placeholder values");
      console.log("Template content length:", template.content.length);
      console.log("Placeholder values:", link.contractData.contractData);
      const regeneratedHtml = replacePlaceholdersInContract(
        template.content,
        link.contractData.contractData
      );
      console.log("Regenerated HTML length:", regeneratedHtml.length);
      console.log("Regenerated HTML preview:", regeneratedHtml.substring(0, 500));
      setContractHtml(regeneratedHtml);
    }
    // Last resort: show template as-is
    else if (template) {
      console.log("⚠ No placeholder values available, showing template as-is");
      console.log("Template content preview:", template.content.substring(0, 500));
      setContractHtml(template.content);
    } else {
      console.error("❌ No template or contract data available");
      setContractHtml("<p>Contract nu este disponibil</p>");
    }
  }, [link.contractData, template]);

  const handleSignatureComplete = async (method: SignatureMethod, value: string) => {
    setIsSubmitting(true);
    try {
      const signatureDate = new Date();

      // Generate access password
      const accessPassword = generateAccessPassword();
      setGeneratedPassword(accessPassword);

      // Save signature to state for PDF generation
      setClientSignature({
        method,
        value,
        signerName: link.clientName || "Client",
        signedAt: signatureDate
      });

      // Add signature to contract
      const signedContractHtml = addSignatureToContract(
        contractHtml,
        method === "uploaded" ? "typed" : method, // uploaded PDFs handled separately
        value,
        link.clientName || "Client",
        signatureDate
      );

      // Build client signature object without undefined fields
      const clientSignatureData: Record<string, any> = {
        method: method,
        signedAt: Date.now(),
        ipAddress: window.location.hostname,
        userAgent: navigator.userAgent,
      };

      // Only add value or fileUrl if they exist
      if (method === "uploaded") {
        clientSignatureData.fileUrl = value;
      } else {
        clientSignatureData.value = value;
      }

      // Save signature to formResponses
      const formResponseData: Record<string, any> = {
        linkId: linkId,
        type: "contract-signature",
        clientSignature: clientSignatureData,
        contractHtml: signedContractHtml,
        submittedAt: Date.now(),
        status: "signed",
      };

      // Only add contractHash if it exists
      if (link.contractData?.contractHash) {
        formResponseData.contractHash = link.contractData.contractHash;
      }

      const formResponseRef = await addDoc(collection(db, "formResponses"), formResponseData);

      // Build client signature object for contractData
      const clientSignatureForContract: any = {
        method: method,
        signedAt: Date.now(),
        ipAddress: window.location.hostname,
        userAgent: navigator.userAgent,
      };

      if (method === "uploaded") {
        clientSignatureForContract.fileUrl = value;
      } else {
        clientSignatureForContract.value = value;
      }

      // Generate PDF with both signatures and upload to Firebase Storage
      let pdfUrl = "";
      try {
        // Build complete HTML with both signatures
        let completeHtml = contractHtml;

        // Add admin signature
        const adminSignature = link.contractData?.adminSignature;
        if (adminSignature && adminSignature.signatureData) {
          completeHtml += generateAdminSignatureHtml(adminSignature);
        }

        // Add client signature
        completeHtml += generateClientSignatureHtml({
          method,
          value,
          signerName: link.clientName || "Client",
          signedAt: signatureDate
        });

        // Generate PDF
        const pdfBlob = await generateContractPDF(completeHtml, link.name || "contract");

        // Upload to Firebase Storage with metadata
        const timestamp = Date.now();
        const fileName = `contracts/${linkId}/signed_contract_${timestamp}.pdf`;
        const pdfStorageRef = storageRef(storage, fileName);

        // Add metadata to ensure contentType is set
        const metadata = {
          contentType: 'application/pdf',
          customMetadata: {
            'linkId': linkId,
            'signedAt': timestamp.toString(),
            'signerName': link.clientName || 'Client'
          }
        };

        await uploadBytes(pdfStorageRef, pdfBlob, metadata);

        // Get download URL
        pdfUrl = await getDownloadURL(pdfStorageRef);

        // Update formResponse with PDF URL
        await updateDoc(doc(db, "formResponses", formResponseRef.id), {
          pdfUrl: pdfUrl,
        });

        console.log("PDF generated and uploaded successfully:", pdfUrl);
      } catch (pdfError) {
        console.error("Error generating/uploading PDF:", pdfError);
        // Continue even if PDF generation fails - signature is still saved
      }

      // Update link status, set access password, save client signature and PDF URL to contractData
      await updateDoc(doc(db, "clientLinks", linkId), {
        status: "completed",
        completedAt: Date.now(),
        accessPassword: accessPassword,
        "contractData.clientSignature": clientSignatureForContract,
        ...(pdfUrl && { "contractData.pdfUrl": pdfUrl }),
      });

      // Store verification in session
      sessionStorage.setItem(`contract_verified_${linkId}`, accessPassword);
      setIsVerified(true);

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting signature:", error);
      alert("Eroare la trimitere. Te rog încearcă din nou.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordVerification = () => {
    if (passwordInput.trim().toUpperCase() === link.accessPassword?.toUpperCase()) {
      sessionStorage.setItem(`contract_verified_${linkId}`, link.accessPassword);
      setIsVerified(true);
      setPasswordError("");
    } else {
      setPasswordError("Parolă incorectă. Te rog încearcă din nou.");
    }
  };

  const handleResendPassword = () => {
    // Verify email matches client email
    if (emailInput.trim().toLowerCase() !== link.clientEmail?.toLowerCase()) {
      setEmailError("Adresa de email nu corespunde cu cea din contract.");
      return;
    }

    // TODO: Implement actual email sending
    // For now, just show success message
    setResendSuccess(true);
    setEmailError("");

    // Hide success message after 5 seconds
    setTimeout(() => {
      setResendSuccess(false);
      setShowForgotPassword(false);
      setEmailInput("");
    }, 5000);
  };

  const copyPasswordToClipboard = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      alert("Parola a fost copiată în clipboard!");
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
    method: SignatureMethod;
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

  const handleDownloadPDF = async () => {
    try {
      let htmlForPdf = contractHtml;

      // Add admin signature to HTML if it exists
      const adminSignature = link.contractData?.adminSignature;
      if (adminSignature && adminSignature.signatureData) {
        const signatureHtml = generateAdminSignatureHtml(adminSignature);
        htmlForPdf = `${htmlForPdf}${signatureHtml}`;
      }

      // Add client signature to HTML if it exists (from state or from loaded link data)
      const clientSig = clientSignature || (link.contractData?.clientSignature ? {
        method: link.contractData.clientSignature.method,
        value: link.contractData.clientSignature.value || link.contractData.clientSignature.fileUrl || '',
        signerName: link.clientName || "Client",
        signedAt: new Date(link.contractData.clientSignature.signedAt || 0)
      } : null);

      if (clientSig) {
        const clientSignatureHtml = generateClientSignatureHtml(clientSig);
        htmlForPdf = `${htmlForPdf}${clientSignatureHtml}`;
      }

      // Generate PDF from enhanced HTML
      const pdf = await generateContractPDF(htmlForPdf, link.name || "contract");

      // Download the PDF
      downloadPDF(pdf, `${link.name || "contract"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Eroare la generarea PDF-ului.");
    }
  };

  // Show password verification screen for completed contracts
  if (link.status === "completed" && link.accessPassword && !isVerified && !submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-semibold text-neutral-100 mb-2">
              Contract Protejat
            </h1>
            <p className="text-neutral-400 text-sm">
              Acest contract este protejat cu parolă. Introdu parola primită după semnare.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Parolă de acces
              </label>
              <input
                type="text"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value.toUpperCase());
                  setPasswordError("");
                }}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordVerification()}
                placeholder="Ex: A3K9M2"
                maxLength={6}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-blue-500 uppercase tracking-wider text-center text-lg font-mono"
              />
              {passwordError && (
                <p className="text-sm text-red-400">{passwordError}</p>
              )}
            </div>

            <button
              onClick={handlePasswordVerification}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Verifică Parola
            </button>

            {/* Forgot Password Section */}
            <div className="pt-4 border-t border-neutral-800">
              <button
                onClick={() => setShowForgotPassword(!showForgotPassword)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors mx-auto block"
              >
                {showForgotPassword ? "Ascunde" : "Ai uitat parola?"}
              </button>

              {showForgotPassword && (
                <div className="mt-4 space-y-3">
                  {resendSuccess ? (
                    <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4 text-center">
                      <div className="text-green-400 mb-2">✅</div>
                      <p className="text-sm text-green-400 font-medium">Parolă retrimisă!</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        Verifică-ți emailul pentru parolă. Dacă nu primești email, verifică și folderul spam.
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-neutral-400 text-center">
                        Pentru a retrimite parola, confirmă adresa de email folosită la semnare:
                      </p>
                      <div className="space-y-2">
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => {
                            setEmailInput(e.target.value);
                            setEmailError("");
                          }}
                          placeholder="adresa@email.com"
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-blue-500 text-sm"
                        />
                        {emailError && (
                          <p className="text-xs text-red-400">{emailError}</p>
                        )}
                      </div>
                      <button
                        onClick={handleResendPassword}
                        disabled={!emailInput.trim()}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
                      >
                        📧 Retrimite Parola
                      </button>
                      <p className="text-xs text-neutral-500 text-center">
                        Emailul trebuie să corespundă cu cel folosit la semnarea contractului.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl">✅</div>
          <h1 className="text-2xl font-semibold text-neutral-100">
            Contract Semnat cu Succes!
          </h1>

          {generatedPassword && (
            <div className="bg-yellow-900/20 border-2 border-yellow-600/50 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="font-semibold">Parolă de Acces Generată</p>
              </div>

              <div className="bg-neutral-900 border border-yellow-600/30 rounded-lg p-4">
                <p className="text-xs text-neutral-400 mb-2">Parola ta de acces:</p>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-3xl font-mono font-bold text-yellow-300 tracking-widest">
                    {showPassword ? generatedPassword : '••••••'}
                  </code>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 hover:bg-neutral-800 rounded transition-colors"
                    title={showPassword ? "Ascunde parola" : "Arată parola"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  onClick={copyPasswordToClipboard}
                  className="mt-3 text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1 mx-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiază Parola
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-yellow-200 font-medium">
                  ⚠️ Salvează această parolă!
                </p>
                <p className="text-xs text-neutral-300">
                  Vei avea nevoie de ea pentru a accesa contractul semnat în viitor.
                </p>
                {link.clientEmail && (
                  <p className="text-xs text-neutral-400">
                    📧 Parola va fi trimisă și pe email la <span className="text-neutral-300">{link.clientEmail}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          <p className="text-neutral-400">
            Contractul a fost semnat și trimis. Poți descărca o copie mai jos.
          </p>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Descarcă Contract Semnat
          </button>
        </div>
      </div>
    );
  }

  // Show completed contract view for verified access to completed contracts
  if (link.status === "completed" && isVerified) {
    return (
      <div className="min-h-screen bg-neutral-950 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Completed Status Banner */}
          <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✅</div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-green-400">Contract Semnat și Completat</h2>
                <p className="text-sm text-neutral-400">
                  Acest contract a fost semnat pe {link.completedAt ? new Date(link.completedAt).toLocaleDateString("ro-RO", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  }) : "data necunoscută"}
                </p>
              </div>
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                📥 Descarcă PDF
              </button>
            </div>
          </div>

          {/* Contract Display */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-neutral-100 mb-2">
                {link.name}
              </h1>
              {link.clientName && (
                <p className="text-sm text-neutral-400">Pentru: {link.clientName}</p>
              )}
            </div>

            <div
              className="prose prose-invert max-w-none text-neutral-300 prose-headings:text-neutral-100 prose-p:text-neutral-300 prose-strong:text-neutral-100 prose-ul:text-neutral-300 prose-ol:text-neutral-300"
              dangerouslySetInnerHTML={{
                __html: contractHtml || "Se încarcă contractul..."
              }}
            />

            {/* Admin Signature Display */}
            {link.contractData?.adminSignature && (
              <div className="mt-8 pt-6 border-t border-neutral-700">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-neutral-500 mb-2">Semnat de Administrator:</p>
                    <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                      {link.contractData.adminSignature.type === "simple" && link.contractData.adminSignature.signatureMethod === "typed" && (
                        <p className="text-3xl font-signature text-neutral-100">
                          {link.contractData.adminSignature.signatureData}
                        </p>
                      )}
                      {link.contractData.adminSignature.type === "simple" && link.contractData.adminSignature.signatureMethod === "drawn" && link.contractData.adminSignature.signatureData && (
                        <img
                          src={link.contractData.adminSignature.signatureData}
                          alt="Admin Signature"
                          className="max-h-32 w-auto"
                        />
                      )}
                      {link.contractData.adminSignature.type === "digital-certificate" && (
                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-900/20 border border-green-700/50 rounded-lg">
                          <span className="text-xl">🛡️</span>
                          <span className="text-sm text-green-400 font-medium">Semnat digital cu certificat</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-neutral-500">
                      <p><strong>Semnat de:</strong> {link.contractData.adminSignature.signedBy}</p>
                      <p><strong>Data:</strong> {new Date(link.contractData.adminSignature.signedAt || 0).toLocaleString('ro-RO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Client Signature Display */}
            {link.contractData?.clientSignature && (
              <div className="mt-6 pt-6 border-t border-neutral-700">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-neutral-500 mb-2">Semnat de Client:</p>
                    <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                      {link.contractData.clientSignature.method === "typed" && link.contractData.clientSignature.value && (
                        <p className="text-3xl font-signature text-neutral-100">
                          {link.contractData.clientSignature.value}
                        </p>
                      )}
                      {link.contractData.clientSignature.method === "drawn" && link.contractData.clientSignature.value && (
                        <img
                          src={link.contractData.clientSignature.value}
                          alt="Client Signature"
                          className="max-h-32 w-auto"
                        />
                      )}
                      {link.contractData.clientSignature.method === "uploaded" && link.contractData.clientSignature.fileUrl && (
                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                          <span className="text-xl">📄</span>
                          <span className="text-sm text-blue-400 font-medium">Semnat cu document PDF</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-neutral-500">
                      <p><strong>Semnat de:</strong> {link.clientName || "Client"}</p>
                      <p><strong>Data:</strong> {new Date(link.contractData.clientSignature.signedAt || 0).toLocaleString('ro-RO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Contract Display */}
        <div className="mb-8 bg-neutral-900 border border-neutral-800 rounded-lg p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-neutral-100 mb-2">
              {link.name}
            </h1>
            {link.clientName && (
              <p className="text-sm text-neutral-400">Pentru: {link.clientName}</p>
            )}
          </div>

          <div
            className="prose prose-invert max-w-none text-neutral-300 prose-headings:text-neutral-100 prose-p:text-neutral-300 prose-strong:text-neutral-100 prose-ul:text-neutral-300 prose-ol:text-neutral-300"
            dangerouslySetInnerHTML={{
              __html: contractHtml || "Se încarcă contractul..."
            }}
          />

          {/* Admin Signature Display */}
          {link.contractData?.adminSignature && (
            <div className="mt-8 pt-6 border-t border-neutral-700">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-xs text-neutral-500 mb-2">Semnat de Administrator:</p>
                  <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                    {link.contractData.adminSignature.type === "simple" && link.contractData.adminSignature.signatureMethod === "typed" && (
                      <p className="text-3xl font-signature text-neutral-100">
                        {link.contractData.adminSignature.signatureData}
                      </p>
                    )}
                    {link.contractData.adminSignature.type === "simple" && link.contractData.adminSignature.signatureMethod === "drawn" && link.contractData.adminSignature.signatureData && (
                      <img
                        src={link.contractData.adminSignature.signatureData}
                        alt="Admin Signature"
                        className="max-h-32 w-auto"
                      />
                    )}
                    {link.contractData.adminSignature.type === "digital-certificate" && (
                      <div className="flex items-center gap-2 text-green-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-sm">Semnat digital cu certificat</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-neutral-500">
                    <p>De: {link.contractData.adminSignature.signedBy}</p>
                    <p>Data: {new Date(link.contractData.adminSignature.signedAt).toLocaleDateString('ro-RO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Signature Section */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
          <h2 className="text-xl font-semibold text-neutral-100 mb-6">
            Semnează Contractul
          </h2>

          <SignatureOptions
            linkId={linkId}
            onSignatureComplete={handleSignatureComplete}
            onDownloadPDF={handleDownloadPDF}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
