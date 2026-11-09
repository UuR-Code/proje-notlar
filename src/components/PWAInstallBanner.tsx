"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Download, X, Share2, PlusSquare } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, isIOS, isDismissed, installApp, dismissPrompt } = usePWA();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Do not show if already installed or dismissed
  if (isInstalled || isDismissed) {
    return null;
  }

  // Only show if installable on Chrome/Android/Desktop OR if on iOS Safari
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else {
      await installApp();
    }
  };

  return (
    <>
      {/* Floating Bottom Card / Banner */}
      <aside
        aria-label="Uygulama Yükleme Bildirimi"
        className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 bg-white/95 backdrop-blur-md border border-blue-100 shadow-xl rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-4"
      >
        <div className="flex items-start gap-3">
          {/* App Icon Thumbnail */}
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-1.5">
            <Image
              src="/icons/icon-192x192.png"
              alt="Proje Notları"
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h4 className="text-sm font-bold text-slate-800 tracking-tight truncate">
                Proje Notları Uygulaması
              </h4>
              <button
                type="button"
                onClick={dismissPrompt}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Kapat"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
              Ana ekranınıza ekleyin; daha hızlı açın ve internet olmasa bile notlarınızı kaydedin.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Uygulamayı Yükle</span>
              </button>
              <button
                type="button"
                onClick={dismissPrompt}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Daha Sonra
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom sm:zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">
                iPhone / iPad&apos;e Yükleyin
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-sm text-slate-600">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs">
                  1
                </div>
                <div className="text-xs">
                  Safari alt araç çubuğundaki <strong className="text-slate-800 inline-flex items-center gap-1"><Share2 className="w-3 h-3 inline text-blue-600" /> Paylaş</strong> simgesine dokunun.
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs">
                  2
                </div>
                <div className="text-xs">
                  Aşağı kaydırıp <strong className="text-slate-800 inline-flex items-center gap-1"><PlusSquare className="w-3 h-3 inline text-blue-600" /> Ana Ekrana Ekle</strong> seçeneğine dokunun.
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs">
                  3
                </div>
                <div className="text-xs">
                  Sağ üst köşedeki <strong className="text-blue-600">Ekle</strong> butonuna basın. Uygulama ana ekranınıza gelecektir.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full mt-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </>
  );
}
