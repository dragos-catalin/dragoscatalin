"use client";

import { useState } from "react";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { ClientFormData } from "@/types/clients";
import ClientForm from "@/components/ClientForm";
import toast from "react-hot-toast";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  clientId?: string; // Required for edit mode
  initialData?: ClientFormData; // For edit mode
  onClientCreated?: (clientId: string, clientData: ClientFormData) => void; // For create mode
  onClientUpdated?: (clientId: string) => void; // For edit mode
}

export default function ClientModal({
  isOpen,
  onClose,
  mode,
  clientId,
  initialData,
  onClientCreated,
  onClientUpdated
}: ClientModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (data: ClientFormData) => {
    setLoading(true);
    try {
      const user = auth.currentUser;

      if (mode === "create") {
        const docRef = await addDoc(collection(db, "clients"), {
          ...data,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          createdBy: user?.uid ?? null,
        });

        toast.success(`Clientul "${data.name}" a fost creat cu succes!`);
        if (onClientCreated) {
          onClientCreated(docRef.id, data);
        }
      } else {
        // Edit mode
        if (!clientId) {
          throw new Error("Client ID is required for edit mode");
        }

        await updateDoc(doc(db, "clients", clientId), {
          ...data,
          updatedAt: Date.now(),
        });

        toast.success(`Clientul "${data.name}" a fost actualizat!`);
        if (onClientUpdated) {
          onClientUpdated(clientId);
        }
      }

      onClose();
    } catch (error) {
      console.error(`Error ${mode === "create" ? "creating" : "updating"} client:`, error);
      toast.error(`Eroare la ${mode === "create" ? "crearea" : "actualizarea"} clientului. Te rog încearcă din nou.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-neutral-950 border border-neutral-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            {mode === "create" ? "Creează client nou" : "Editează client"}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1 text-sm rounded border border-neutral-700 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✕
          </button>
        </div>

        <ClientForm
          mode={mode}
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </div>
    </div>
  );
}
