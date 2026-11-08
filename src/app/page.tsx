"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, AlertTriangle, FileText, ChevronRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { QuickNoteCard } from "@/components/QuickNoteCard";
import { NoteItem, NoteItemData } from "@/components/NoteItem";
import { EditNoteModal } from "@/components/EditNoteModal";
import { ProjectIcon } from "@/components/ProjectIcon";
import { formatTurkishRelativeTime, NoteCategory } from "@/lib/utils";

export default function DashboardPage() {
  const { projects, setIsNewProjectModalOpen, noteTrigger } = useApp();
  const [recentNotes, setRecentNotes] = useState<NoteItemData[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [editingNote, setEditingNote] = useState<NoteItemData | null>(null);
  const [defaultCategory, setDefaultCategory] = useState<NoteCategory>("general");

  const fetchRecentNotes = useCallback(async () => {
    try {
      setIsLoadingNotes(true);
      const res = await fetch("/api/notes?limit=10");
      if (res.ok) {
        const data = await res.json();
        setRecentNotes(data);
      }
    } catch (err) {
      console.error("fetchRecentNotes error:", err);
    } finally {
      setIsLoadingNotes(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentNotes();
  }, [fetchRecentNotes, noteTrigger]);

  const handleQuickAddIssue = () => {
    setDefaultCategory("issue");
    // Scroll smoothly to quick note card
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Projeler & Notlar
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Projelerin için hızlıca not al, eksikleri takip et, fikirlerini kaybetme. 🚀
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-semibold rounded-xl shadow-xs shadow-blue-500/20 active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yeni Proje</span>
          </button>

          <button
            type="button"
            onClick={handleQuickAddIssue}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs md:text-sm font-medium rounded-xl transition-colors shadow-2xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Eksik Ekle</span>
          </button>

          <Link
            href="/notes"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs md:text-sm font-medium rounded-xl transition-colors shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Tüm Notlar</span>
          </Link>
        </div>
      </div>

      {/* ⚡ Hızlı Not Ekle Card */}
      <QuickNoteCard
        key={defaultCategory}
        defaultCategory={defaultCategory}
        onNoteAdded={fetchRecentNotes}
      />

      {/* Two Column Layout Below */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left Column: Son Eklenen Notlar (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">📋</span>
              <h2 className="text-sm font-bold text-slate-800">
                Bugün Eklenen Notlar ({recentNotes.length})
              </h2>
            </div>
            <Link
              href="/notes"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center gap-0.5"
            >
              <span>Tümünü Gör</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoadingNotes ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-2xl">
              Notlar yükleniyor...
            </div>
          ) : recentNotes.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-lg">
                💡
              </div>
              <p className="text-sm font-semibold text-slate-700">Henüz hiç not eklenmedi</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Yukarıdaki hızlı not ekleme alanını kullanarak aklınıza gelen ilk fikri veya eksikliği anında yazın!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  showProjectBadge={true}
                  onEdit={(n) => setEditingNote(n)}
                  onRefresh={fetchRecentNotes}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Son Güncellenen Projeler (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">🔄</span>
              <h2 className="text-sm font-bold text-slate-800">Son Güncellenen Projeler</h2>
            </div>
            <Link
              href="/projects"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center gap-0.5"
            >
              <span>Tümü ({projects.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {projects.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="group flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl hover:border-blue-300 hover:shadow-card transition-all"
              >
                <div className="flex items-center gap-3 truncate">
                  <ProjectIcon name={p.name} icon={p.icon} color={p.color} size="md" />
                  <div className="truncate">
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                      {p.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{p.totalNotes} not</span>
                      <span>•</span>
                      <span>{formatTurkishRelativeTime(p.lastOpenedAt || p.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}

            {projects.length === 0 && (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-400">Henüz proje oluşturmadınız.</p>
                <button
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                >
                  + Yeni Proje Oluştur
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Note Modal */}
      <EditNoteModal
        note={editingNote}
        isOpen={Boolean(editingNote)}
        onClose={() => setEditingNote(null)}
        onSuccess={fetchRecentNotes}
      />
    </div>
  );
}
