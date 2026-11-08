"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Eye, EyeOff } from "lucide-react";
import { useToast } from "./Toast";
import { useApp } from "@/context/AppContext";

interface EditProjectModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProjectModal({ project, isOpen, onClose, onSuccess }: EditProjectModalProps) {
  const { refreshProjects } = useApp();
  const { success, error } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [adminUrl, setAdminUrl] = useState("");
  const [status, setStatus] = useState("active");
  const [priority, setPriority] = useState("normal");
  const [color, setColor] = useState("#2563eb");
  const [icon, setIcon] = useState("folder");
  const [tagsInput, setTagsInput] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
      setUrl(project.url || "");
      setAdminUrl(project.adminUrl || "");
      setStatus(project.status || "active");
      setPriority(project.priority || "normal");
      setColor(project.color || "#2563eb");
      setIcon(project.icon || "folder");
      setTagsInput(project.tags ? project.tags.join(", ") : "");

      const firstCred = project.credentials?.[0];
      setUsername(firstCred?.username || "");
      setPassword(firstCred?.decryptedPassword || "");
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error("Proje adı zorunludur.");
      return;
    }

    try {
      setIsSubmitting(true);
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          url: url.trim() || null,
          adminUrl: adminUrl.trim() || null,
          status,
          priority,
          color,
          icon,
          tags,
          credentialUsername: username.trim() || null,
          credentialPassword: password.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Proje güncellenemedi.");

      success("Proje bilgileri güncellendi.");
      await refreshProjects();
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const projectColors = ["#2563eb", "#10b981", "#8b5cf6", "#f43f5e", "#f59e0b", "#06b6d4"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-modal max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Projeyi Düzenle</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Proje Adı *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Açıklama
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Durum
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="active">Aktif</option>
                <option value="pending">Beklemede</option>
                <option value="completed">Tamamlandı</option>
                <option value="archived">Arşivlendi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Öncelik
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="low">Düşük</option>
                <option value="normal">Normal</option>
                <option value="high">Yüksek</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Canlı Site URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Yönetim Paneli URL
              </label>
              <input
                type="url"
                value={adminUrl}
                onChange={(e) => setAdminUrl(e.target.value)}
                placeholder="https://panel..."
                className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giriş Kullanıcı Adı
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@proje.com"
                className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giriş Şifresi / Kasa Notu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Gizli şifre"
                  className="w-full pl-3 pr-8 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Etiketler (Virgülle ayırın)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="SaaS, WhatsApp, Mobil"
              className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Renk
            </label>
            <div className="flex items-center gap-2 pt-1">
              {projectColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    color === c ? "border-slate-800 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Kaydediliyor..." : "Kaydet"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
