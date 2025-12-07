"use client";

import { useState } from "react";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ClientLink, ContractData } from "@/types/client-links";

interface ContractDataFormProps {
  id: string;
  link: ClientLink;
}

export default function ContractDataForm({ id, link }: ContractDataFormProps) {
  const [formData, setFormData] = useState<ContractData>({
    companyName: "",
    cui: "",
    address: "",
    city: "",
    county: "",
    postalCode: "",
    contactPersonName: "",
    contactEmail: link.clientEmail || "",
    billingEmail: "",
    phone: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.companyName ||
      !formData.cui ||
      !formData.address ||
      !formData.contactPersonName ||
      !formData.contactEmail ||
      !formData.phone
    ) {
      alert("Te rog completează toate câmpurile obligatorii.");
      return;
    }

    setSubmitting(true);

    try {
      // Save form response
      await setDoc(doc(db, "formResponses", id), {
        linkId: id,
        type: "contract-data",
        answers: formData,
        submittedAt: Date.now(),
      });

      // Update link status
      await updateDoc(doc(db, "clientLinks", id), {
        status: "completed",
        completedAt: Date.now(),
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("A apărut o eroare. Te rog încearcă din nou.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl">🎉</div>
          <h1 className="text-2xl font-semibold text-neutral-100">
            Mulțumim!
          </h1>
          <p className="text-neutral-400">
            Am primit datele pentru contract. Îți vom trimite contractul spre semnare în cel mai scurt timp.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-100 mb-2">
            Date pentru Contract
          </h1>
          {link.clientName && (
            <p className="text-sm text-neutral-400">Pentru: {link.clientName}</p>
          )}
          <p className="text-sm text-neutral-500 mt-2">
            Aceste date vor fi folosite pentru întocmirea contractului de colaborare și facturare.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-300 border-b border-neutral-800 pb-2">
              Date companie
            </h3>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Denumire firmă *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                placeholder="Ex: SC Example SRL"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                CUI (fără RO) *
              </label>
              <input
                type="text"
                name="cui"
                value={formData.cui}
                onChange={handleChange}
                required
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                placeholder="Ex: 12345678"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Adresă completă (strada, nr, bloc, etc.) *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                placeholder="Ex: Str. Exemplu nr. 10, bl. A, sc. 1, et. 2, ap. 5"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">
                  Oraș *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                  placeholder="București"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">
                  Județ *
                </label>
                <input
                  type="text"
                  name="county"
                  value={formData.county}
                  onChange={handleChange}
                  required
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                  placeholder="Ilfov"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">
                  Cod poștal *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                  placeholder="012345"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-300 border-b border-neutral-800 pb-2">
              Persoană de contact
            </h3>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Nume complet *
              </label>
              <input
                type="text"
                name="contactPersonName"
                value={formData.contactPersonName}
                onChange={handleChange}
                required
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                placeholder="Ex: Ion Popescu"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">
                  Email contact *
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                  placeholder="email@firma.ro"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">
                  Email facturare (dacă diferă)
                </label>
                <input
                  type="email"
                  name="billingEmail"
                  value={formData.billingEmail}
                  onChange={handleChange}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                  placeholder="facturare@firma.ro"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Telefon *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                placeholder="+40 xxx xxx xxx"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-black font-medium py-3 px-6 rounded-lg hover:bg-neutral-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Se trimite..." : "Trimite date contract"}
            </button>
          </div>

          <p className="text-xs text-neutral-600 text-center">
            * Câmpuri obligatorii
          </p>
        </form>
      </div>
    </div>
  );
}
