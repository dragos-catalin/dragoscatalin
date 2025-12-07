"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Template } from "@/types/templates";
import TemplateForm, { TemplateFormData } from "@/components/TemplateForm";

export default function EditTemplatePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id || "";
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<TemplateFormData>>();

  useEffect(() => {
    if (!id) return;

    const loadTemplate = async () => {
      try {
        const snap = await getDoc(doc(db, "templates", id));
        if (!snap.exists()) {
          alert("Template-ul nu a fost găsit.");
          router.push("/dashboard/templates");
          return;
        }

        const data = snap.data();
        setInitialData({
          name: data.name,
          type: data.type,
          language: data.language,
          status: data.status,
          description: data.description || "",
          content: data.content,
          tags: data.tags?.join(", ") || "",
        });
      } catch (error) {
        console.error("Error loading template:", error);
        alert("Eroare la încărcare. Te rog încearcă din nou.");
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [id, router]);

  const handleSubmit = async (data: TemplateFormData) => {
    const tags = data.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);

    try {
      await updateDoc(doc(db, "templates", id), {
        name: data.name,
        type: data.type,
        language: data.language,
        status: data.status,
        description: data.description || null,
        content: data.content,
        tags: tags.length > 0 ? tags : null,
        updatedAt: Date.now(),
      });

      router.push("/dashboard/templates");
    } catch (error) {
      console.error("Error updating template:", error);
      alert("Eroare la actualizare. Te rog încearcă din nou.");
      throw error;
    }
  };

  return (
    <TemplateForm 
      mode="edit" 
      initialData={initialData}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}
