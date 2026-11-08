"use client";

import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { NoteItemData } from "./NoteItem";
import { CATEGORIES, PRIORITIES } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { useToast } from "./Toast";

interface EditNoteModalProps {
  note: NoteItemData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditNoteModal({ note, isOpen, onClose, onSuccess }: EditNoteModalProps) {
  const { projects } = useApp();
  const { success, error } = useToast();

  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("general");
  const [priority, setPriority] = useState<string>("normal");
  const [status, setStatus] = useState<string>("open");
  const [projectId, setProjectId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (note) {
      setContent(note.content || "");
      setCategory(note.category || "general");
      setPriority(note.priority || "normal");
      setStatus(note.status || "open");
      setProjectId(note.projectId || "");
    }
  }, [note]);

  if (!isOpen || !note) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      error("Not içeriği boş olamaz.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          category,
          priority,
          status,
          projectId,
        }),
      });

      if (!res.ok) throw new Error("Not güncellenemedi.");

      success("Not güncellendi.");
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-modal max-w-lg w-full">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Notu Düzenle</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Not İçeriği
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full resize-none p-3 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Durum
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="open">Açık</option>
                <option value="in_progress">Yapılıyor</option>
                <option value="completed">Tamamlandı</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Öncelik
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proje
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
