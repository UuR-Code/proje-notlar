"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Check, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (note) {
      setContent(note.content || "");
      setCategory(note.category || "general");
      setPriority(note.priority || "normal");
      setStatus(note.status || "open");
      setProjectId(note.projectId || "");
      setImageUrl(note.imageUrl || null);
    }
  }, [note]);

  if (!isOpen || !note) return null;

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      error("Lütfen sadece resim dosyası seçin.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      error("Resim boyutu 10MB'dan küçük olmalıdır.");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Görsel yüklenemedi");
      }

      const data = await res.json();
      setImageUrl(data.url);
      success("Görsel eklendi!");
    } catch (err: any) {
      error(err.message || "Görsel yükleme hatası");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleFileUpload(file);
          break;
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) {
      error("Not içeriği veya görsel bulunmalıdır.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim() || "(Ekran görüntüsü eklendi)",
          category,
          priority,
          status,
          projectId,
          imageUrl: imageUrl || null,
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
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={handlePaste}
              placeholder="Not içeriğini yazın... (Ctrl+V ile görsel yapıştırabilirsiniz)"
              className="w-full resize-none p-3 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Attached Image / Screenshot */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Ekran Görüntüsü / Resim</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{imageUrl ? "Resmi Değiştir" : "Resim Ekle"}</span>
              </button>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                  e.target.value = "";
                }
              }}
            />

            {isUploading && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Görsel yükleniyor...</span>
              </div>
            )}

            {imageUrl && !isUploading && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={imageUrl}
                    alt="Not görseli"
                    className="w-14 h-12 object-cover rounded-lg border border-slate-200"
                  />
                  <div>
                    <span className="text-xs font-medium text-slate-800 block">Ekran görüntüsü eklendi</span>
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      Büyük boyutta gör ↗
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Resmi Kaldır"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
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
