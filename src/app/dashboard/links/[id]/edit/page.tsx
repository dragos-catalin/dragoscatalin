"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ClientLink } from "@/types/client-links";
import LinkForm, { LinkFormData } from "@/components/LinkForm";

export default function EditLinkPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState<Partial<LinkFormData> | undefined>(undefined);

  useEffect(() => {
    if (!id) return;

    const loadLink = async () => {
      try {
        const snap = await getDoc(doc(db, "clientLinks", id));
        if (!snap.exists()) {
          alert("Link-ul nu a fost găsit.");
          router.push("/dashboard/links");
          return;
        }

        const data = snap.data();
        const linkData: ClientLink = {
          id: snap.id,
          name: data.name,
          type: data.type,
          templateId: data.templateId,
          preFillData: data.preFillData,
          clientFieldMapping: data.clientFieldMapping,
          clientId: data.clientId,
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          note: data.note,
          expiresInDays: data.expiresInDays,
          expiresAt: data.expiresAt,
          createdAt: data.createdAt,
          createdBy: data.createdBy,
          status: data.status,
          completedAt: data.completedAt,
          contractData: data.contractData,
        };

        setInitialData({
          name: linkData.name,
          templateId: linkData.templateId || "",
          preFillData: linkData.preFillData || {},
          clientFieldMapping: linkData.clientFieldMapping || {},
          clientId: linkData.clientId || "",
          clientName: linkData.clientName || "",
          clientEmail: linkData.clientEmail || "",
          note: linkData.note || "",
          expiresInDays: linkData.expiresInDays !== undefined ? linkData.expiresInDays : 1,
          status: linkData.status,
          contractData: linkData.contractData,
        });
      } catch (error) {
        console.error("Error loading link:", error);
        alert("Eroare la încărcare. Te rog încearcă din nou.");
      } finally {
        setLoading(false);
      }
    };

    loadLink();
  }, [id, router]);

  const handleSubmit = async (data: LinkFormData, shouldClose: boolean) => {
    setSaving(true);

    try {
      const now = Date.now();
      const expiresAt = data.expiresInDays && data.expiresInDays > 0
        ? now + (data.expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      // Determine link type based on contract data
      const linkType = data.contractData ? "contract" : "form";

      // Prepare update data
      const updateData: any = {
        name: data.name,
        type: linkType,
        templateId: data.templateId,
        clientId: data.clientId || null,
        clientName: data.clientName || null,
        clientEmail: data.clientEmail || null,
        note: data.note || null,
        expiresInDays: data.expiresInDays !== undefined ? data.expiresInDays : 1,
        expiresAt: expiresAt,
        status: data.status,
        updatedAt: now,
      };

      // Add form-specific or contract-specific data
      if (linkType === "form") {
        updateData.preFillData = Object.keys(data.preFillData).length > 0 ? data.preFillData : null;
        updateData.clientFieldMapping = data.clientFieldMapping && Object.keys(data.clientFieldMapping).length > 0 ? data.clientFieldMapping : null;
        updateData.contractData = null; // Clear contract data if switching to form
      } else {
        updateData.contractData = data.contractData;
        updateData.preFillData = null; // Clear form data if switching to contract
        updateData.clientFieldMapping = null;
      }

      await updateDoc(doc(db, "clientLinks", id), updateData);

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
      console.error("Error updating link:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-sm text-neutral-400">Se încarcă link-ul...</div>
      </div>
    );
  }

  return (
    <LinkForm
      mode="edit"
      initialData={initialData}
      onSubmit={handleSubmit}
      loading={saving}
      linkId={id}
    />
  );
}
