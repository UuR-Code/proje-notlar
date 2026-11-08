"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, FileText } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NoteItem, NoteItemData } from "@/components/NoteItem";
import { EditNoteModal } from "@/components/EditNoteModal";
import { CATEGORIES, PRIORITIES } from "@/lib/utils";

export default function AllNotesPage() {
  const { projects, noteTrigger } = useApp();
  const [notes, setNotes] = useState<NoteItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("uncompleted"); // Default to open/in_progress
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNote, setEditingNote] = useState<NoteItemData | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedProject !== "all") params.append("projectId", selectedProject);
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedPriority !== "all") params.append("priority", selectedPriority);
      if (searchQuery.trim()) params.append("query", searchQuery.trim());

      const res = await fetch(`/api/notes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error("fetchNotes error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject, selectedCategory, selectedStatus, selectedPriority, searchQuery]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes, noteTrigger]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Tüm Notlar</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Tüm projelerindeki fikirleri, eksikleri ve notları tek ekranda filtrele ve incele.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-400">
          Toplam {notes.length} not gösteriliyor
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Project Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Proje
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">Tüm Projeler</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">Tüm Kategoriler</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Durum
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="uncompleted">Tamamlanmamış (Açık)</option>
              <option value="all">Tümü (Tamamlananlar Dahil)</option>
              <option value="open">Sadece Açık</option>
              <option value="completed">Sadece Tamamlananlar</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Öncelik
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">Tüm Öncelikler</option>
              {PRIORITIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search bar inside toolbar */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Not içeriğinde veya başlığında ara..."
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Notes List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-2xl">
          Notlar yükleniyor...
        </div>
      ) : notes.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <p className="text-sm font-semibold text-slate-700">Not bulunamadı</p>
          <p className="text-xs text-slate-400 mt-1">
            Seçili filtrelere uygun bir not bulunamadı. Filtreleri temizlemeyi deneyin.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              showProjectBadge={true}
              onEdit={(n) => setEditingNote(n)}
              onRefresh={fetchNotes}
            />
          ))}
        </div>
      )}

      {/* Edit Note Modal */}
      <EditNoteModal
        note={editingNote}
        isOpen={Boolean(editingNote)}
        onClose={() => setEditingNote(null)}
        onSuccess={fetchNotes}
      />
    </div>
  );
}
