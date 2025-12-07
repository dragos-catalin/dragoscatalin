"use client";

import { useState } from "react";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ClientLink, DiscoveryData } from "@/types/client-links";

interface DiscoveryFormProps {
  id: string;
  link: ClientLink;
}

export default function DiscoveryForm({ id, link }: DiscoveryFormProps) {
  const [formData, setFormData] = useState<DiscoveryData>({
    mainObjective: "",
    problemsToSolve: "",
    existingMaterials: "",
    targetAudience: "",
    competitors: "",
    contactEmail: link.clientEmail || "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.mainObjective || !formData.problemsToSolve || !formData.contactEmail) {
      alert("Te rog completează toate câmpurile obligatorii.");
      return;
    }

    setSubmitting(true);

    try {
      // Save form response
      await setDoc(doc(db, "formResponses", id), {
        linkId: id,
        type: "discovery",
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
            Am primit răspunsurile tale. Te vom contacta în cel mai scurt timp cu o ofertă detaliată.
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
            Discovery Session
          </h1>
          {link.clientName && (
            <p className="text-sm text-neutral-400">Pentru: {link.clientName}</p>
          )}
          <p className="text-sm text-neutral-500 mt-2">
            Aceste informații ne vor ajuta să înțelegem mai bine nevoile tale și să îți oferim o ofertă personalizată.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              Care este obiectivul principal al proiectului? *
            </label>
            <textarea
              name="mainObjective"
              value={formData.mainObjective}
              onChange={handleChange}
              required
              rows={4}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
              placeholder="Ex: Vreau să cresc vânzările online cu 30% în următoarele 6 luni..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              Ce probleme încearcă să rezolve acest proiect? *
            </label>
            <textarea
              name="problemsToSolve"
              value={formData.problemsToSolve}
              onChange={handleChange}
              required
              rows={4}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
              placeholder="Ex: Site-ul actual este învechit, nu am sistem de plată online, procesul de comandă este complicat..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              Există materiale existente? (design, texte, branding) *
            </label>
            <textarea
              name="existingMaterials"
              value={formData.existingMaterials}
              onChange={handleChange}
              required
              rows={3}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
              placeholder="Ex: Da, avem logo și ghid de identitate vizuală / Nu, trebuie totul creat de la zero"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              Cine este publicul țintă?
            </label>
            <input
              type="text"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
              placeholder="Ex: Tineri 18-35 ani, pasionați de tehnologie"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              Competitori sau exemple de inspirație
            </label>
            <textarea
              name="competitors"
              value={formData.competitors}
              onChange={handleChange}
              rows={3}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
              placeholder="Link-uri către site-uri care îți plac sau competitori..."
            />
          </div>

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

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-black font-medium py-3 px-6 rounded-lg hover:bg-neutral-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Se trimite..." : "Trimite răspunsuri"}
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
