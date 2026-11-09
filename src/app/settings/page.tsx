"use client";

import React, { useState, useRef } from "react";
import { Settings, Download, Upload, User, Lock, Check, LogOut, FileSpreadsheet, Database, Smartphone, Wifi, RefreshCw, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/Toast";
import { usePWA } from "@/hooks/usePWA";

export default function SettingsPage() {
  const { currentUser, refreshUser, refreshProjects } = useApp();
  const { success, error } = useToast();
  const { isInstallable, isInstalled, isIOS, isOnline, installApp } = usePWA();
  const [isUpdatingCache, setIsUpdatingCache] = useState(false);

  const handleUpdateCache = async () => {
    try {
      setIsUpdatingCache(true);
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          await reg.update();
        }
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      success("Uygulama önbelleği yenilendi. Sayfa güncelleniyor...");
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      error("Önbellek güncellenirken bir hata oluştu.");
    } finally {
      setIsUpdatingCache(false);
    }
  };

  const [name, setName] = useState(currentUser?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [includeSecretsInExport, setIncludeSecretsInExport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Profil güncellenemedi.");
      }

      success("Profil bilgileri başarıyla güncellendi.");
      setCurrentPassword("");
      setNewPassword("");
      await refreshUser();
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleExport = (format: "json" | "csv") => {
    const url = `/api/export?format=${format}&includeSecrets=${includeSecretsInExport}`;
    window.open(url, "_blank");
    success(`${format.toUpperCase()} yedeği indiriliyor...`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      const parsed = JSON.parse(text);

      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "İçe aktarılamadı.");
      }

      const resData = await res.json();
      success(resData.message || "Veriler başarıyla içe aktarıldı!");
      await refreshProjects();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      error(err.message || "Geçersiz yedek JSON dosyası.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    success("Başarıyla çıkış yapıldı.");
    window.location.href = "/login";
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-600" />
          <span>Ayarlar ve Veri Yönetimi</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
          Hesap bilgileri, güvenlik kasası ve yedekleme (JSON / CSV) işlemleri.
        </p>
      </div>

      {/* Profile & Password Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card space-y-5">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-3">
          <User className="w-4 h-4 text-blue-600" />
          <span>Profil ve Hesap Bilgileri</span>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ad Soyad
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs md:text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-posta Adresi
              </label>
              <input
                type="email"
                disabled
                value={currentUser?.email || ""}
                className="w-full px-3 py-2 text-xs md:text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Şifre Değiştir (İsteğe bağlı)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Mevcut şifreniz"
                  className="w-full px-3 py-2 text-xs md:text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Yeni şifreniz (en az 6 karakter)"
                  className="w-full px-3 py-2 text-xs md:text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-semibold rounded-xl shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{isUpdatingProfile ? "Güncelleniyor..." : "Bilgileri Kaydet"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backup, Export & Import Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card space-y-5">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-3">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Veri Yedekleme ve Dışa/İçe Aktarma</span>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Dışa Aktarma (Backup)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tüm projelerini, bağlantılarını ve notlarını yedek olarak bilgisayarına indir.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={includeSecretsInExport}
                onChange={(e) => setIncludeSecretsInExport(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>
                <strong>Gizli Şifreleri Dahil Et:</strong> Varsayılan olarak parola notları gizlilik için dışa aktarılmaz. Bu seçeneği işaretlerseniz şifreler çözülerek yedek dosyasına eklenir.
              </span>
            </label>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleExport("json")}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>JSON Olarak İndir</span>
              </button>

              <button
                type="button"
                onClick={() => handleExport("csv")}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Notları CSV (Excel) İndir</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                İçe Aktarma (Geri Yükle)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Daha önce indirdiğiniz JSON yedeğini yükleyerek projelerinizi ve notlarınızı güvenle geri yükleyin. Mevcut kayıtlarınız kaybolmaz, birleştirilir.
              </p>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="backup-file-upload"
              />
              <button
                type="button"
                disabled={isImporting}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>{isImporting ? "Yükleniyor ve Doğrulanıyor..." : "JSON Yedek Dosyası Seç"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PWA & Offline Usage Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Uygulama (PWA) ve Çevrimdışı Mod</h3>
            <p className="text-xs text-slate-500">Masaüstü veya mobil cihazınıza tam ekran uygulama olarak kurun.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isInstalled ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Yüklü (Standalone)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                    <Smartphone className="w-3.5 h-3.5" /> Tarayıcı Modu
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-800">Cihaza Kurulum</h4>
              <p className="text-xs text-slate-500 mt-1">
                {isInstalled
                  ? "Proje Notları cihazınızda yüklü ve tam ekran yerel uygulama deneyimiyle çalışıyor."
                  : "Uygulamayı ana ekranınıza ekleyerek tek tıkla açabilir, adres çubuğu olmadan tam ekran kullanabilirsiniz."}
              </p>
            </div>

            {!isInstalled && isInstallable && (
              <button
                type="button"
                onClick={installApp}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Uygulamayı Şimdi Yükle</span>
              </button>
            )}

            {!isInstalled && isIOS && (
              <p className="text-xs text-indigo-700 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100 font-medium">
                Safari&apos;de <strong>Paylaş</strong> simgesine dokunun ve <strong>Ana Ekrana Ekle</strong>&apos;yi seçin.
              </p>
            )}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  <Wifi className="w-3.5 h-3.5" /> {isOnline ? "Çevrimiçi" : "Çevrimdışı"}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800">Service Worker & Önbellek</h4>
              <p className="text-xs text-slate-500 mt-1">
                Uygulama dosyaları ve arayüz yerel önbellekte saklanır. İnternet kesintilerinde bile açılır.
              </p>
            </div>

            <button
              type="button"
              disabled={isUpdatingCache}
              onClick={handleUpdateCache}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isUpdatingCache ? "animate-spin" : ""}`} />
              <span>{isUpdatingCache ? "Yenileniyor..." : "Önbelleği Temizle & Güncelle"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Oturumu Kapat</h3>
          <p className="text-xs text-slate-500">Mevcut cihazdaki oturumunuzu güvenle sonlandırın.</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
}
