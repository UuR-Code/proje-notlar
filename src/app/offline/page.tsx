"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, Home } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <WifiOff className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        İnternet Bağlantısı Yok
      </h1>

      <p className="text-slate-600 max-w-sm text-sm mb-8">
        Şu anda çevrimdışı görünüyorsunuz. Proje Notları önbelleğindeki verilere erişebilirsiniz veya bağlantınız düzeldiğinde tekrar deneyebilirsiniz.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          Tekrar Dene
        </button>

        <Link
          href="/"
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-colors shadow-xs"
        >
          <Home className="w-4 h-4" />
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
