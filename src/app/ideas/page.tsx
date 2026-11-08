"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Lightbulb } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NoteItem, NoteItemData } from "@/components/NoteItem";
import { EditNoteModal } from "@/components/EditNoteModal";

export default function IdeasPage() {
  const { noteTrigger } = useApp();
  const [ideas, setIdeas] = useState<NoteItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<NoteItemData | null>(null);

  const fetchIdeas = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/notes?category=idea&limit=150");
      if (res.ok) {
        const data = await res.json();
        setIdeas(data);
      }
    } catch (err) {
      console.error("fetchIdeas error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas, noteTrigger]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <span>Yeni Fikirler</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Aklına gelen tüm yeni özellik, entegrasyon ve iş fikirleri.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-400">
          Toplam {ideas.length} fikir
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-2xl">
          Fikirler listeleniyor...
        </div>
      ) : ideas.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl">
            💡
          </div>
          <p className="text-sm font-semibold text-slate-700">Henüz fikir eklenmedi</p>
          <p className="text-xs text-slate-400">
            Ana sayfadaki hızlı not ekleme alanından &quot;Yeni Fikir&quot; kategorisini seçerek ilk fikrini kaydet.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {ideas.map((item) => (
            <NoteItem
              key={item.id}
              note={item}
              showProjectBadge={true}
              onEdit={(n) => setEditingNote(n)}
              onRefresh={fetchIdeas}
            />
          ))}
        </div>
      )}

      {/* Edit Note Modal */}
      <EditNoteModal
        note={editingNote}
        isOpen={Boolean(editingNote)}
        onClose={() => setEditingNote(null)}
        onSuccess={fetchIdeas}
      />
    </div>
  );
}
