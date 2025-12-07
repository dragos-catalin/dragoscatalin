"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ClientLink, FormResponse } from "@/types/client-links";
import Link from "next/link";
import toast from "react-hot-toast";
import ProjectDetailsModal from "@/components/ProjectDetailsModal";

const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://dragoscatalin.ro";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ClientLink[]>([]);
  const [responses, setResponses] = useState<Record<string, FormResponse>>({});
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<ClientLink | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Load projects (client links)
  useEffect(() => {
    const q = query(collection(db, "clientLinks"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, async (snap) => {
      const items: ClientLink[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          name: data.name || `Proiect ${doc.id.substring(0, 6)}`,
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
        });
      });
      setProjects(items);

      // Load responses for all projects
      const responsesMap: Record<string, FormResponse> = {};
      const responsesSnap = await getDocs(collection(db, "formResponses"));
      responsesSnap.forEach((doc) => {
        const data = doc.data();
        responsesMap[data.linkId] = {
          id: doc.id,
          linkId: data.linkId,
          type: data.type,
          answers: data.answers,
          submittedAt: data.submittedAt,
          clientSignature: data.clientSignature,
          contractHtml: data.contractHtml,
          contractHash: data.contractHash,
          status: data.status,
          pdfUrl: data.pdfUrl,
        };
      });
      setResponses(responsesMap);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleDelete = async (project: ClientLink) => {
    if (!confirm(`Ștergi proiectul "${project.name}"?`)) return;

    try {
      await deleteDoc(doc(db, "clientLinks", project.id));
      toast.success("Proiect șters cu succes!");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Eroare la ștergere. Te rog încearcă din nou.");
    }
  };

  const getPublicUrl = (id: string) => `${PUBLIC_BASE_URL}/form/${id}`;

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(url);
      toast.success("Link copiat în clipboard!");
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (e) {
      console.error("Copy failed:", e);
      toast.error("Eroare la copiere. Încearcă manual.");
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "project-intake":
        return "Intake Proiect";
      case "discovery":
        return "Discovery";
      case "contract-data":
        return "Date Contract";
      case "contract":
        return "Contract";
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 border-green-400/30 bg-green-400/10";
      case "expired":
        return "text-red-400 border-red-400/30 bg-red-400/10";
      default:
        return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completat";
      case "expired":
        return "Expirat";
      default:
        return "În așteptare";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredProjects = projects.filter((project) => {
    const matchesType = typeFilter === "all" || project.type === typeFilter;
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "pending").length,
    completed: projects.filter((p) => p.status === "completed").length,
    contracts: projects.filter((p) => p.type === "contract" && p.status === "completed").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-100"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Proiecte & Contracte</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Gestionează proiectele și contractele tale
          </p>
        </div>
        <Link
          href="/dashboard/links/new"
          className="px-4 py-2 bg-neutral-100 text-neutral-900 rounded-lg hover:bg-neutral-200 transition-colors font-medium text-sm w-fit"
        >
          + Proiect nou
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="text-sm text-neutral-400">Total proiecte</div>
          <div className="text-2xl font-semibold mt-1">{stats.total}</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="text-sm text-neutral-400">Active</div>
          <div className="text-2xl font-semibold mt-1 text-yellow-400">{stats.active}</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="text-sm text-neutral-400">Completate</div>
          <div className="text-2xl font-semibold mt-1 text-green-400">{stats.completed}</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="text-sm text-neutral-400">Contracte semnate</div>
          <div className="text-2xl font-semibold mt-1 text-blue-400">{stats.contracts}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Caută după nume proiect sau client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:border-neutral-700"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:border-neutral-700"
        >
          <option value="all">Toate tipurile</option>
          <option value="project-intake">Intake Proiect</option>
          <option value="discovery">Discovery</option>
          <option value="contract-data">Date Contract</option>
          <option value="contract">Contract</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:border-neutral-700"
        >
          <option value="all">Toate statusurile</option>
          <option value="pending">În așteptare</option>
          <option value="completed">Completat</option>
          <option value="expired">Expirat</option>
        </select>
      </div>

      {/* Projects Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-800/50 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Proiect
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Data creării
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">
                    {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                      ? "Nu s-au găsit proiecte cu criteriile selectate"
                      : "Nu există proiecte încă"}
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">{project.name}</div>
                      {project.note && (
                        <div className="text-xs text-neutral-400 mt-1">{project.note}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>{project.clientName || "-"}</div>
                      {project.clientEmail && (
                        <div className="text-xs text-neutral-400 mt-1">{project.clientEmail}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {getTypeLabel(project.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {getStatusLabel(project.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-400">
                      {formatDate(project.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* View Details */}
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                          title="Vezi detalii"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Copy Link (if pending) */}
                        {project.status === "pending" && (
                          <button
                            onClick={() => copyToClipboard(getPublicUrl(project.id))}
                            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                            title="Copiază link"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        )}

                        {/* Edit */}
                        <Link
                          href={`/dashboard/links/${project.id}/edit`}
                          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                          title="Editează"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(project)}
                          className="p-2 hover:bg-red-900/20 text-red-400 rounded-lg transition-colors"
                          title="Șterge"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          response={responses[selectedProject.id]}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
