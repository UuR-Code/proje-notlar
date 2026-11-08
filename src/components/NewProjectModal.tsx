"use client";

import React, { useState } from "react";
import { X, Eye, EyeOff, Globe, Link2, User, Key, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useToast } from "./Toast";
import { useRouter } from "next/navigation";

export function NewProjectModal() {
  const { isNewProjectModalOpen, setIsNewProjectModalOpen, refreshProjects, setActiveProjectId } = useApp();
  const { success, error } = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [adminUrl, setAdminUrl] = useState("");
  const [username, setUsername] = useState("");
  const [passwordNote, setPasswordNote] = useState("");
  const [priority, setPriority] = useState("normal");
  const [tagsInput, setTagsInput] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [icon, setIcon] = useState("folder");
  const [showPassword, setShowPassword] = useState(false);
  const [autoOpenNotes, setAutoOpenNotes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isNewProjectModalOpen) return null;

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

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          url: url.trim() || undefined,
          adminUrl: adminUrl.trim() || undefined,
          username: username.trim() || undefined,
          passwordNote: passwordNote.trim() || undefined,
          priority,
          icon,
          color,
          tags,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Proje oluşturulamadı.");
      }

      const createdProject = await res.json();

      success(`"${name}" projesi başarıyla oluşturuldu!`);
      await refreshProjects();
      setActiveProjectId(createdProject.id);
      setIsNewProjectModalOpen(false);

      // Reset form
      setName("");
      setDescription("");
      setUrl("");
      setAdminUrl("");
      setUsername("");
      setPasswordNote("");
      setTagsInput("");

      // Navigate to project details if requested
      if (autoOpenNotes) {
        router.push(`/projects/${createdProject.id}`);
      }
    } catch (err: any) {
      error(err.message || "Proje oluşturulurken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const projectColors = ["#2563eb", "#10b981", "#8b5cf6", "#f43f5e", "#f59e0b", "#06b6d4"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-modal max-w-2xl w-full max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-50 text-blue-600 font-bold text-sm">
              +
            </span>
            <h2 className="text-lg font-bold text-slate-800">Yeni Proje Oluştur</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsNewProjectModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proje Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn. WhatsApp SaaS"
                  className="w-full px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Proje hakkında kısa bir açıklama..."
                  className="w-full resize-none px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Öncelik
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="low">Düşük</option>
                    <option value="normal">Orta (Normal)</option>
                    <option value="high">Yüksek</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Simge & Renk
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    <select
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value="folder">Klasör</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="globe">Web / Dünya</option>
                      <option value="heart">Kalp</option>
                      <option value="shopping-cart">Sepet</option>
                      <option value="sparkles">Yapay Zeka</option>
                    </select>
                    {projectColors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-5 h-5 rounded-full border-2 transition-all ${
                          color === c ? "border-slate-800 scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proje URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-9 pr-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yönetim Paneli URL
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={adminUrl}
                    onChange={(e) => setAdminUrl(e.target.value)}
                    placeholder="https://panel..."
                    className="w-full pl-9 pr-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kullanıcı Adı (Giriş)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Kullanıcı adı veya e-posta"
                    className="w-full pl-9 pr-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Şifre Notu (Güvenli Kasa)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordNote}
                    onChange={(e) => setPasswordNote(e.target.value)}
                    placeholder="Şifre, API anahtarı (şifreli saklanır)"
                    className="w-full pl-9 pr-10 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                  placeholder="SaaS, WhatsApp, Mobil..."
                  className="w-full px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Checkbox option */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={autoOpenNotes}
                onChange={(e) => setAutoOpenNotes(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>
                <strong>Hızlı not alanını otomatik aç:</strong> Projeyi oluşturduktan sonra anında detay sayfasına git ve not ekle.
              </span>
            </label>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className={`flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-xl text-white transition-all ${
                name.trim() && !isSubmitting
                  ? "bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 active:scale-98"
                  : "bg-slate-300 cursor-not-allowed"
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? "Oluşturuluyor..." : "Projeyi Oluştur"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
