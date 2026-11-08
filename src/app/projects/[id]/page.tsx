"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Edit,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Archive,
  Link as LinkIcon,
} from "lucide-react";
import { ProjectIcon } from "@/components/ProjectIcon";
import { QuickNoteCard } from "@/components/QuickNoteCard";
import { NoteItem, NoteItemData } from "@/components/NoteItem";
import { EditNoteModal } from "@/components/EditNoteModal";
import { EditProjectModal } from "@/components/EditProjectModal";
import { useToast } from "@/components/Toast";
import { useApp } from "@/context/AppContext";
import { PROJECT_STATUSES } from "@/lib/utils";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { refreshProjects } = useApp();
  const { success, error } = useToast();

  const [project, setProject] = useState<any>(null);
  const [notes, setNotes] = useState<NoteItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "issue" | "idea" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItemData | null>(null);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const fetchProjectDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const [projRes, notesRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/notes?projectId=${projectId}`),
      ]);

      if (projRes.ok) {
        const projData = await projRes.json();
        setProject(projData);
      } else {
        error("Proje bulunamadı.");
        router.push("/");
        return;
      }

      if (notesRes.ok) {
        const notesData = await notesRes.json();
        setNotes(notesData);
      }
    } catch (err) {
      console.error("fetchProjectDetails error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, router, error]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    success(`${label} panoya kopyalandı!`);
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLinkLabel.trim(), url: newLinkUrl.trim() }),
      });
      if (!res.ok) throw new Error("Bağlantı eklenemedi.");

      success("Bağlantı eklendi.");
      setNewLinkLabel("");
      setNewLinkUrl("");
      setIsAddLinkOpen(false);
      fetchProjectDetails();
    } catch (err: any) {
      error(err.message);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm(`"${project.name}" projesini arşive kaldırmak istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Proje silinemedi.");

      success("Proje arşivlendi.");
      await refreshProjects();
      router.push("/");
    } catch (err: any) {
      error(err.message);
    }
  };

  if (isLoading && !project) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Proje bilgileri yükleniyor...
      </div>
    );
  }

  if (!project) return null;

  // Filter notes in memory for instant feedback without re-fetching
  const filteredNotes = notes.filter((n) => {
    if (activeFilter === "completed") {
      if (n.status !== "completed") return false;
    } else if (activeFilter === "issue") {
      if (n.category !== "issue" && n.category !== "bug") return false;
    } else if (activeFilter === "idea") {
      if (n.category !== "idea") return false;
    } else {
      // "all" - by default shows open notes or all notes
    }

    if (searchQuery.trim()) {
      return n.content.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const totalCount = notes.length;
  const issuesCount = notes.filter((n) => (n.category === "issue" || n.category === "bug") && n.status !== "completed").length;
  const ideasCount = notes.filter((n) => n.category === "idea" && n.status !== "completed").length;
  const completedCount = notes.filter((n) => n.status === "completed").length;

  const primaryCredential = project.credentials?.[0];
  const statusInfo = PROJECT_STATUSES.find((s) => s.id === project.status) || PROJECT_STATUSES[0];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Projeler</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-700">{project.name}</span>
        </div>

        <button
          onClick={handleDeleteProject}
          className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 text-xs"
          title="Projeyi Arşivle"
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Arşivle</span>
        </button>
      </div>

      {/* Project Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <ProjectIcon
              name={project.name}
              icon={project.icon}
              color={project.color}
              size="xl"
              className="shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                  {project.name}
                </h1>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${statusInfo.badgeClass}`}>
                  {statusInfo.label}
                </span>
              </div>
              {project.description && (
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsEditProjectOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs md:text-sm font-semibold rounded-xl transition-colors shadow-2xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Düzenle</span>
            </button>
          </div>
        </div>

        {/* 4 Metadata Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Card 1: Proje URL */}
          <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/60 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Proje URL
            </span>
            <div className="flex items-center justify-between gap-1.5 mt-1.5">
              {project.url ? (
                <>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-blue-600 hover:underline truncate max-w-[150px]"
                  >
                    {project.url.replace(/^https?:\/\//, "")}
                  </a>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => copyToClipboard(project.url, "URL")}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                      title="Kopyala"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                      title="Yeni Sekmede Aç"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </>
              ) : (
                <span className="text-xs text-slate-400 italic">Tanımlanmadı</span>
              )}
            </div>
          </div>

          {/* Card 2: Giriş Bilgileri (Kasa) */}
          <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/60 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Giriş Bilgileri
              </span>
              {primaryCredential?.decryptedPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600"
                  title={showPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
            <div className="mt-1.5">
              {primaryCredential ? (
                <div className="flex items-center justify-between gap-1">
                  <div className="truncate text-xs font-medium text-slate-700">
                    <div>{primaryCredential.username || "Kullanıcı adı yok"}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {showPassword
                        ? primaryCredential.decryptedPassword || "Şifre yok"
                        : "••••••••"}
                    </div>
                  </div>
                  {primaryCredential.decryptedPassword && (
                    <button
                      onClick={() =>
                        copyToClipboard(primaryCredential.decryptedPassword, "Şifre")
                      }
                      className="p-1 text-slate-400 hover:text-slate-600 shrink-0"
                      title="Şifreyi Kopyala"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">Kayıtlı giriş yok</span>
              )}
            </div>
          </div>

          {/* Card 3: Kısa Açıklama */}
          <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/60 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Kısa Açıklama
            </span>
            <div className="text-xs text-slate-600 line-clamp-2 mt-1.5">
              {project.description || "Ek açıklama eklenmedi."}
            </div>
          </div>

          {/* Card 4: Etiketler */}
          <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/60 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Etiketler
            </span>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {project.tags && project.tags.length > 0 ? (
                project.tags.map((t: string) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">Etiket yok</span>
              )}
            </div>
          </div>
        </div>

        {/* Project Links Section (if multiple links or button to add) */}
        {project.links && project.links.length > 0 && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Hızlı Bağlantılar:</span>
            {project.links.map((link: any) => (
              <div
                key={link.id}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
              >
                <LinkIcon className="w-3 h-3 text-slate-400" />
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-slate-700 hover:text-blue-600 hover:underline"
                >
                  {link.label}
                </a>
                <button
                  onClick={() => copyToClipboard(link.url, link.label)}
                  className="p-0.5 text-slate-400 hover:text-slate-600 ml-0.5"
                  title="URL Kopyala"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setIsAddLinkOpen(true)}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium px-2 py-1"
            >
              <Plus className="w-3 h-3" />
              <span>Yeni Bağlantı</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Link Modal */}
      {isAddLinkOpen && (
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-card">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Yeni Proje Bağlantısı Ekle
          </h3>
          <form onSubmit={handleAddLink} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              required
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              placeholder="Bağlantı Başlığı (Örn. Coolify Panel, GitHub)"
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
            <input
              type="url"
              required
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
              >
                Ekle
              </button>
              <button
                type="button"
                onClick={() => setIsAddLinkOpen(false)}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Note Card pre-locked to this project */}
      <QuickNoteCard
        lockedProjectId={project.id}
        compact={true}
        onNoteAdded={fetchProjectDetails}
      />

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          {/* Filter Pills with Counts */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeFilter === "all"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Tümü ({totalCount})
            </button>

            <button
              onClick={() => setActiveFilter("issue")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeFilter === "issue"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-700 border border-slate-200"
              }`}
            >
              <span>Eksikler ({issuesCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter("idea")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeFilter === "idea"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-amber-50 hover:text-amber-700 border border-slate-200"
              }`}
            >
              <span>Yeni Fikirler ({ideasCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter("completed")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeFilter === "completed"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200"
              }`}
            >
              <span>Tamamlananlar ({completedCount})</span>
            </button>
          </div>

          {/* Quick inline note search */}
          <div className="w-full sm:w-60">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Bu projede not ara..."
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Notes List */}
        {filteredNotes.length === 0 ? (
          <div className="p-10 text-center bg-white border border-slate-200 rounded-2xl">
            <p className="text-xs text-slate-400">
              {searchQuery ? "Aramanızla eşleşen not bulunamadı." : "Bu filtrede gösterilecek not yok."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                showProjectBadge={false}
                onEdit={(n) => setEditingNote(n)}
                onRefresh={fetchProjectDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      <EditProjectModal
        project={project}
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        onSuccess={fetchProjectDetails}
      />

      {/* Edit Note Modal */}
      <EditNoteModal
        note={editingNote}
        isOpen={Boolean(editingNote)}
        onClose={() => setEditingNote(null)}
        onSuccess={fetchProjectDetails}
      />
    </div>
  );
}
