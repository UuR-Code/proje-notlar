"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NoteItem, NoteItemData } from "@/components/NoteItem";
import { EditNoteModal } from "@/components/EditNoteModal";

export default function IssuesPage() {
  const { noteTrigger } = useApp();
  const [issues, setIssues] = useState<NoteItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<NoteItemData | null>(null);
  const [filterType, setFilterType] = useState<"all" | "issue" | "bug" | "improvement">("all");

  const fetchIssues = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/notes?status=uncompleted&limit=150");
      if (res.ok) {
        const allNotes: NoteItemData[] = await res.json();
        // Filter issues, bugs, and improvements
        const filtered = allNotes.filter(
          (n) => n.category === "issue" || n.category === "bug" || n.category === "improvement"
        );
        setIssues(filtered);
      }
    } catch (err) {
      console.error("fetchIssues error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues, noteTrigger]);

  const displayedIssues = issues.filter((item) => {
    if (filterType === "all") return true;
    return item.category === filterType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <span>Eksikler ve Hatalar</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Tüm projelerinde çözülmeyi bekleyen eksik, hata ve iyileştirme kayıtları.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === "all"
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Tümü ({issues.length})
          </button>
          <button
            onClick={() => setFilterType("issue")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === "issue"
                ? "bg-rose-600 text-white"
                : "bg-white text-slate-600 hover:bg-rose-50 border border-slate-200"
            }`}
          >
            <span>Eksikler ({issues.filter((i) => i.category === "issue").length})</span>
          </button>
          <button
            onClick={() => setFilterType("bug")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === "bug"
                ? "bg-red-600 text-white"
                : "bg-white text-slate-600 hover:bg-red-50 border border-slate-200"
            }`}
          >
            <span>Hatalar ({issues.filter((i) => i.category === "bug").length})</span>
          </button>
          <button
            onClick={() => setFilterType("improvement")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === "improvement"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 hover:bg-blue-50 border border-slate-200"
            }`}
          >
            <span>İyileştirmeler ({issues.filter((i) => i.category === "improvement").length})</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-2xl">
          Eksikler listeleniyor...
        </div>
      ) : displayedIssues.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Harika! Bekleyen eksik veya hata yok.</p>
          <p className="text-xs text-slate-400">
            Tüm projelerindeki eksik ve hatalar çözülmüş durumda veya henüz kaydedilmemiş.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayedIssues.map((item) => (
            <NoteItem
              key={item.id}
              note={item}
              showProjectBadge={true}
              onEdit={(n) => setEditingNote(n)}
              onRefresh={fetchIssues}
            />
          ))}
        </div>
      )}

      {/* Edit Note Modal */}
      <EditNoteModal
        note={editingNote}
        isOpen={Boolean(editingNote)}
        onClose={() => setEditingNote(null)}
        onSuccess={fetchIssues}
      />
    </div>
  );
}
