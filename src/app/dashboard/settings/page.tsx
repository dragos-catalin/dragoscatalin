"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { UserProfile, UserProfileFormData } from "@/types/user-profile";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UserProfileFormData>({
    name: "",
    email: "",
    phone: "",
    role: "",
    company: "",
    companyAddress: "",
    companyCUI: "",
    companyRC: "",
    website: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(db, "userProfiles", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || "",
          company: data.company || "",
          companyAddress: data.companyAddress || "",
          companyCUI: data.companyCUI || "",
          companyRC: data.companyRC || "",
          website: data.website || "",
        });
      } else {
        // Initialize with user email
        setFormData({
          ...formData,
          email: user.email || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Eroare la încărcare setări.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    if (!formData.name || !formData.email || !formData.company) {
      toast.error("Te rog completează câmpurile obligatorii: Nume, Email, Companie.");
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, "userProfiles", user.uid);
      const docSnap = await getDoc(docRef);
      const now = Date.now();

      await setDoc(docRef, {
        id: user.uid,
        ...formData,
        createdAt: docSnap.exists() ? (docSnap.data() as UserProfile).createdAt : now,
        updatedAt: now,
      });

      toast.success("Setări salvate cu succes!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Eroare la salvare. Te rog încearcă din nou.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-neutral-400">Se încarcă...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Setări profil</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Completează informațiile tale pentru a fi folosite în contracte și documente
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="border border-neutral-800 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium">Informații personale</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Nume complet *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                placeholder="Ex: Dragoș Cătălin"
              />
              <p className="text-xs text-neutral-500">Folosit pentru {`{{myName}}`}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                placeholder="Ex: contact@dragoscatalin.ro"
              />
              <p className="text-xs text-neutral-500">Folosit pentru {`{{myEmail}}`}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                placeholder="Ex: +40 xxx xxx xxx"
              />
              <p className="text-xs text-neutral-500">Folosit pentru {`{{myPhone}}`}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Calitate / Rol
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                placeholder="Ex: Administrator, Director General"
              />
              <p className="text-xs text-neutral-500">Folosit pentru {`{{myselfAs}}`}</p>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="border border-neutral-800 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium">Informații companie</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-neutral-300">
                Nume companie / firmă *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                placeholder="Ex: Dragoș Development SRL"
              />
              <p className="text-xs text-neutral-500">Folosit pentru {`{{myCompany}}`}</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-neutral-300">
                Sediu / Adresă
              </label>
              <input
                type="text"
                value={formData.companyAddress}
                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                placeholder="Ex: Str. Exemplu nr. 123, București, România"
              />
              <p className="text-xs text-neutral-500">Folosit pentru {`{{myCompanyAddress}}`}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                CUI
              </label>
              <input
                type="text"
                value={formData.companyCUI}
                onChange={(e) => setFormData({ ...formData, companyCUI: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                placeholder="Ex: RO12345678"
              />
              <p className="text-xs text-neutral-500">Folosit pentru {`{{myCompanyCUI}}`}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Registrul Comerțului
              </label>
              <input
                type="text"
                value={formData.companyRC}
                onChange={(e) => setFormData({ ...formData, companyRC: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                placeholder="Ex: J40/1234/2024"
              />
              <p className="text-xs text-neutral-500">Folosit pentru {`{{myCompanyRC}}`}</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-neutral-300">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                placeholder="Ex: https://dragoscatalin.ro"
              />
              <p className="text-xs text-neutral-500">Folosit pentru {`{{myWebsite}}`}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 text-sm rounded bg-white text-black hover:bg-neutral-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Se salvează..." : "Salvează setări"}
          </button>
        </div>
      </form>
    </div>
  );
}
