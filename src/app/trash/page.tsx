"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trash2, RotateCcw, AlertOctagon } from "lucide-react";
import { useToast } from "@/components/Toast";
import { formatTurkishRelativeTime } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

export default function TrashPage() {
  const { triggerNoteAdded } = useApp();
  const { success, error } = useToast();
  const [trashNotes, setTrashNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrash = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/trash");
      if (res.ok) {
        setTrashNotes(await res.json());
      }
    } catch (err) {
      console.error("fetchTrash error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}/restore`, { method: "POST" });
      if (!res.ok) throw new Error("Geri yüklenemedi.");

      success("Not geri yüklendi!");
      fetchTrash();
      triggerNoteAdded();
    } catch (err: any) {
      error(err.message);
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm("Çöp kutusundaki tüm notları kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }

    try {
      const res = await fetch("/api/trash", { method: "DELETE" });
      if (!res.ok) throw new Error("Çöp kutusu boşaltılamadı.");

      success("Çöp kutusu tamamen boşaltıldı.");
      fetchTrash();
    } catch (err: any) {
      error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-500" />
            <span>Çöp Kutusu</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Yanlışlıkla silinen notları buradan tek tıkla geri yükleyebilirsiniz.
          </p>
        </div>

        {trashNotes.length > 0 && (
          <button
            type="button"
            onClick={handleEmptyTrash}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Çöp Kutusunu Boşalt</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-2xl">
          Çöp kutusu taranıyor...
        </div>
      ) : trashNotes.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <p className="text-sm font-semibold text-slate-700">Çöp kutusu boş</p>
          <p className="text-xs text-slate-400 mt-1">Silinmiş herhangi bir not bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {trashNotes.map((note) => (
            <div
              key={note.id}
              className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl"
            >
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm text-slate-800">{note.content}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span className="font-medium text-slate-600">{note.project?.name}</span>
                  <span>•</span>
                  <span>Silinme: {formatTurkishRelativeTime(note.deletedAt)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRestore(note.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Geri Al</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
