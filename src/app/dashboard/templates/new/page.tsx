"use client";

import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import TemplateForm, { TemplateFormData } from "@/components/TemplateForm";

export default function NewTemplatePage() {
  const router = useRouter();

  const handleSubmit = async (data: TemplateFormData, shouldClose: boolean) => {
    const user = auth.currentUser;
    const tags = data.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);

    try {
      await addDoc(collection(db, "templates"), {
        name: data.name,
        type: data.type,
        language: data.language,
        status: data.status,
        description: data.description || null,
        content: data.content,
        tags: tags.length > 0 ? tags : null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: user?.uid ?? null,
      });

      if (shouldClose) {
        router.push("/dashboard/templates");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      alert("Eroare la creare. Te rog încearcă din nou.");
      throw error;
    }
  };

  return <TemplateForm mode="create" onSubmit={handleSubmit} />;
}
