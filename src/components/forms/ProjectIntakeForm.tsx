"use client";

import { useState } from "react";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ClientLink, ProjectIntakeData } from "@/types/client-links";

interface ProjectIntakeFormProps {
  id: string;
  link: ClientLink;
}

export default function ProjectIntakeForm({ id, link }: ProjectIntakeFormProps) {
  const [formData, setFormData] = useState<ProjectIntakeData>({
    businessName: "",
    currentWebsite: "",
    projectDescription: "",
    estimatedBudget: "",
    desiredTimeline: "",
    contactEmail: link.clientEmail || "",
    contactPhone: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.businessName || !formData.projectDescription || !formData.contactEmail) {
      alert("Te rog completează toate câmpurile obligatorii.");
      return;
    }

    setSubmitting(true);

    try {
      // Save form response
      await setDoc(doc(db, "formResponses", id), {
        linkId: id,
        type: "project-intake",
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
            Am primit răspunsurile tale. Te vom contacta în cel mai scurt timp.
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
            Brief Proiect
          </h1>
          {link.clientName && (
            <p className="text-sm text-neutral-400">Pentru: {link.clientName}</p>
          )}
          <p className="text-sm text-neutral-500 mt-2">
            Te rog completează informațiile de mai jos pentru a începe colaborarea.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              Nume firmă / Business *
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
              placeholder="Ex: RentCar SRL"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              Website curent (dacă există)
            </label>
            <input
              type="url"
              name="currentWebsite"
              value={formData.currentWebsite}
              onChange={handleChange}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              Descriere proiect *
            </label>
            <textarea
              name="projectDescription"
              value={formData.projectDescription}
              onChange={handleChange}
              required
              rows={5}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
              placeholder="Descrie pe scurt ce îți dorești să construim împreună..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Buget estimativ *
              </label>
              <select
                name="estimatedBudget"
                value={formData.estimatedBudget}
                onChange={handleChange}
                required
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 focus:outline-none focus:border-neutral-600"
              >
                <option value="">Selectează...</option>
                <option value="sub-1000">Sub 1.000 EUR</option>
                <option value="1000-3000">1.000 - 3.000 EUR</option>
                <option value="3000-5000">3.000 - 5.000 EUR</option>
                <option value="5000-10000">5.000 - 10.000 EUR</option>
                <option value="peste-10000">Peste 10.000 EUR</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Termen dorit *
              </label>
              <select
                name="desiredTimeline"
                value={formData.desiredTimeline}
                onChange={handleChange}
                required
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-100 focus:outline-none focus:border-neutral-600"
              >
                <option value="">Selectează...</option>
                <option value="urgent">Urgent (1-2 săptămâni)</option>
                <option value="1-month">1 lună</option>
                <option value="2-3-months">2-3 luni</option>
                <option value="flexible">Flexibil</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
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
                Telefon (opțional)
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
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
              {submitting ? "Se trimite..." : "Trimite brief"}
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
