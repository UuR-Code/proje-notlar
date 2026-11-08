"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Clock, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NoteItem, NoteItemData } from "@/components/NoteItem";
import { EditNoteModal } from "@/components/EditNoteModal";

export default function TrackingPage() {
  const { noteTrigger } = useApp();
  const [notes, setNotes] = useState<NoteItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<NoteItemData | null>(null);

  const fetchTrackingNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch open notes
      const res = await fetch("/api/notes?status=uncompleted&limit=100");
      if (res.ok) {
        const data: NoteItemData[] = await res.json();
        // Filter high priority or pinned
        const tracking = data.filter((n) => n.priority === "high" || n.isPinned);
        setNotes(tracking);
      }
    } catch (err) {
      console.error("fetchTrackingNotes error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrackingNotes();
  }, [fetchTrackingNotes, noteTrigger]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Takip Listesi</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Yüksek öncelikli ve başa sabitlenmiş önemli not ve eksikler.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-400">
          Toplam {notes.length} odak maddesi
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-2xl">
          Takip listesi yükleniyor...
        </div>
      ) : notes.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Takip listesi tertemiz!</p>
          <p className="text-xs text-slate-400">
            Yüksek öncelikli veya sabitlenmiş açık bir not bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notes.map((item) => (
            <NoteItem
              key={item.id}
              note={item}
              showProjectBadge={true}
              onEdit={(n) => setEditingNote(n)}
              onRefresh={fetchTrackingNotes}
            />
          ))}
        </div>
      )}

      {/* Edit Note Modal */}
      <EditNoteModal
        note={editingNote}
        isOpen={Boolean(editingNote)}
        onClose={() => setEditingNote(null)}
        onSuccess={fetchTrackingNotes}
      />
    </div>
  );
}
