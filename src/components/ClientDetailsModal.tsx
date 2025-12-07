"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Client } from "@/types/clients";
import { ClientLink } from "@/types/client-links";
import Link from "next/link";
import toast from "react-hot-toast";

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onEdit: () => void;
}

export default function ClientDetailsModal({
  isOpen,
  onClose,
  client,
  onEdit
}: ClientDetailsModalProps) {
  const [links, setLinks] = useState<ClientLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !client.id) return;

    const loadLinks = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "clientLinks"),
          where("clientId", "==", client.id)
        );
        const snap = await getDocs(q);
        const items: ClientLink[] = [];
        snap.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            name: data.name,
            type: data.type,
            templateId: data.templateId,
            preFillData: data.preFillData,
            clientId: data.clientId,
            clientName: data.clientName,
            clientEmail: data.clientEmail,
            note: data.note,
            createdAt: data.createdAt,
            createdBy: data.createdBy,
            status: data.status,
            completedAt: data.completedAt,
          });
        });
        setLinks(items);
      } catch (error) {
        console.error("Error loading client links:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLinks();
  }, [isOpen, client.id]);

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 border-green-400/30 bg-green-400/10";
      case "pending":
        return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
      case "expired":
        return "text-red-400 border-red-400/30 bg-red-400/10";
      default:
        return "text-neutral-400 border-neutral-400/30 bg-neutral-400/10";
    }
  };

  const copyLinkUrl = (linkId: string) => {
    const url = `${window.location.origin}/form/${linkId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiat în clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-neutral-950 border border-neutral-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Detalii client</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="px-3 py-1 text-sm rounded border border-neutral-700 hover:bg-neutral-800 transition-colors"
            >
              ✏️ Editează
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm rounded border border-neutral-700 hover:bg-neutral-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Client Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <div className="text-xs text-neutral-500">Nume</div>
                <div className="text-sm text-neutral-200">{client.name}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500">Email</div>
                <div className="text-sm text-neutral-200">{client.email}</div>
              </div>
              {client.phone && (
                <div>
                  <div className="text-xs text-neutral-500">Telefon</div>
                  <div className="text-sm text-neutral-200">{client.phone}</div>
                </div>
              )}
              {client.company && (
                <div>
                  <div className="text-xs text-neutral-500">Companie</div>
                  <div className="text-sm text-neutral-200">{client.company}</div>
                </div>
              )}
              {client.cui && (
                <div>
                  <div className="text-xs text-neutral-500">CUI/CIF</div>
                  <div className="text-sm text-neutral-200">{client.cui}</div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {client.address && (
                <div>
                  <div className="text-xs text-neutral-500">Adresă</div>
                  <div className="text-sm text-neutral-200">{client.address}</div>
                </div>
              )}
              {client.city && (
                <div>
                  <div className="text-xs text-neutral-500">Oraș</div>
                  <div className="text-sm text-neutral-200">{client.city}</div>
                </div>
              )}
              {client.county && (
                <div>
                  <div className="text-xs text-neutral-500">Județ</div>
                  <div className="text-sm text-neutral-200">{client.county}</div>
                </div>
              )}
              {client.postalCode && (
                <div>
                  <div className="text-xs text-neutral-500">Cod poștal</div>
                  <div className="text-sm text-neutral-200">{client.postalCode}</div>
                </div>
              )}
            </div>
          </div>

          {client.notes && (
            <div>
              <div className="text-xs text-neutral-500 mb-1">Notițe</div>
              <div className="text-sm text-neutral-200 p-3 bg-neutral-900/50 border border-neutral-800 rounded">
                {client.notes}
              </div>
            </div>
          )}

          {/* Assigned Links */}
          <div className="pt-4 border-t border-neutral-800">
            <h3 className="text-sm font-medium text-neutral-200 mb-3">
              Link-uri asociate ({links.length})
            </h3>

            {loading ? (
              <div className="text-sm text-neutral-500 text-center py-4">Se încarcă...</div>
            ) : links.length === 0 ? (
              <div className="text-sm text-neutral-500 text-center py-4">
                Niciun link asociat acestui client
              </div>
            ) : (
              <div className="space-y-2">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="p-3 border border-neutral-800 rounded-lg hover:bg-neutral-900/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-neutral-200">{link.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(link.status)}`}>
                            {link.status}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500">
                          Creat: {new Date(link.createdAt).toLocaleDateString("ro-RO", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </div>
                        {link.note && (
                          <div className="text-xs text-neutral-400 mt-1">{link.note}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => copyLinkUrl(link.id)}
                          className="px-2 py-1 text-xs rounded border border-neutral-700 hover:bg-neutral-800 transition-colors"
                          title="Copiază URL"
                        >
                          📋
                        </button>
                        <Link
                          href={`/dashboard/links/${link.id}/edit`}
                          className="px-2 py-1 text-xs rounded border border-neutral-700 hover:bg-neutral-800 transition-colors"
                        >
                          Editează
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-neutral-800 text-xs text-neutral-600">
            <div>Creat: {new Date(client.createdAt).toLocaleString("ro-RO")}</div>
            <div>Actualizat: {new Date(client.updatedAt).toLocaleString("ro-RO")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
