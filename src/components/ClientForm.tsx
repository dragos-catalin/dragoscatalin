"use client";

import { useState } from "react";
import { ClientFormData } from "@/types/clients";

interface ClientFormProps {
  initialData?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => Promise<void>;
  onCancel: () => void;
  mode: "create" | "edit";
  loading?: boolean;
}

export default function ClientForm({
  initialData,
  onSubmit,
  onCancel,
  mode,
  loading = false
}: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    company: initialData?.company || "",
    cui: initialData?.cui || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    county: initialData?.county || "",
    postalCode: initialData?.postalCode || "",
    notes: initialData?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      alert("Numele și emailul sunt obligatorii!");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Te rog introdu o adresă de email validă!");
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-200">Informații de bază</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm text-neutral-400">
              Nume <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-600"
              placeholder="Nume client sau companie..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-neutral-400">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-600"
              placeholder="contact@example.com"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm text-neutral-400">Telefon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-600"
              placeholder="+40 123 456 789"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-neutral-400">Companie</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-600"
              placeholder="Nume companie..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-neutral-400">CUI/CIF</label>
          <input
            type="text"
            value={formData.cui}
            onChange={(e) => setFormData({ ...formData, cui: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-600"
            placeholder="RO12345678"
          />
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4 pt-4 border-t border-neutral-800">
        <h3 className="text-sm font-medium text-neutral-200">Adresă</h3>
        
        <div className="space-y-2">
          <label className="block text-sm text-neutral-400">Adresă</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-600"
            placeholder="Str. Exemplu nr. 1..."
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm text-neutral-400">Oraș</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-600"
              placeholder="București"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-neutral-400">Județ</label>
            <input
              type="text"
              value={formData.county}
              onChange={(e) => setFormData({ ...formData, county: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-600"
              placeholder="București"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-neutral-400">Cod poștal</label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-600"
              placeholder="012345"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4 pt-4 border-t border-neutral-800">
        <h3 className="text-sm font-medium text-neutral-200">Notițe</h3>
        
        <div className="space-y-2">
          <label className="block text-sm text-neutral-400">Notițe adiționale</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-600 resize-none"
            placeholder="Notițe despre client..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm rounded border border-neutral-700 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anulează
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm rounded bg-white text-black hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Se salvează..." : mode === "create" ? "Creează client" : "Salvează modificările"}
        </button>
      </div>
    </form>
  );
}
