"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import LinkForm, { LinkFormData } from "@/components/LinkForm";

export default function NewLinkPage() {
  const router = useRouter();
  const [createdLinkId, setCreatedLinkId] = useState<string | undefined>(undefined);

  const handleSubmit = async (data: LinkFormData, shouldClose: boolean) => {
    const user = auth.currentUser;

    try {
      const now = Date.now();
      const expiresAt = data.expiresInDays && data.expiresInDays > 0
        ? now + (data.expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      // Determine link type based on template or contract data
      const linkType = data.contractData ? "contract" : "form";

      const docRef = await addDoc(collection(db, "clientLinks"), {
        name: data.name,
        type: linkType,
        templateId: data.templateId,
        // Form-specific fields
        ...(linkType === "form" && {
          preFillData: Object.keys(data.preFillData).length > 0 ? data.preFillData : null,
          clientFieldMapping: data.clientFieldMapping && Object.keys(data.clientFieldMapping).length > 0 ? data.clientFieldMapping : null,
        }),
        // Contract-specific fields
        ...(linkType === "contract" && {
          contractData: data.contractData,
        }),
        // Common fields
        clientId: data.clientId || null,
        clientName: data.clientName || null,
        clientEmail: data.clientEmail || null,
        note: data.note || null,
        expiresInDays: data.expiresInDays !== undefined ? data.expiresInDays : 1,
        expiresAt: expiresAt,
        createdAt: now,
        createdBy: user?.uid ?? null,
        status: data.status,
      });

      // Store the created link ID for PDF generation
      setCreatedLinkId(docRef.id);

      // Update client with contract placeholder values if client is selected
      if (data.clientId && data.contractData?.contractData) {
        try {
          const clientUpdates: any = { updatedAt: now };
          const placeholders = data.contractData.contractData;

          // Map placeholder values to client fields
          if (placeholders.clientName) clientUpdates.name = placeholders.clientName;
          if (placeholders.clientEmail) clientUpdates.email = placeholders.clientEmail;
          if (placeholders.clientPhone) clientUpdates.phone = placeholders.clientPhone;
          if (placeholders.clientCompany) clientUpdates.company = placeholders.clientCompany;
          if (placeholders.clientCUI) clientUpdates.cui = placeholders.clientCUI;
          if (placeholders.clientRC) clientUpdates.rc = placeholders.clientRC;
          if (placeholders.clientAs) clientUpdates.representativeRole = placeholders.clientAs;
          if (placeholders.clientAddress) clientUpdates.address = placeholders.clientAddress;

          // Only update if there are changes
          if (Object.keys(clientUpdates).length > 1) {
            await updateDoc(doc(db, "clients", data.clientId), clientUpdates);
          }
        } catch (clientError) {
          console.error("Error updating client:", clientError);
          // Continue even if client update fails
        }
      }

      if (shouldClose) {
        router.push("/dashboard/links");
      }
    } catch (error) {
      console.error("Error creating link:", error);
      throw error;
    }
  };

  return <LinkForm mode="create" onSubmit={handleSubmit} linkId={createdLinkId} />;
}
