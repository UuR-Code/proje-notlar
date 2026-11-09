"use client";

import React from "react";
import { WifiOff } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-white text-xs font-medium px-4 py-1.5 flex items-center justify-center gap-2 shadow-xs transition-all animate-in fade-in slide-in-from-top-2">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Çevrimdışı moddasınız. Önbelleğe alınmış notlarınıza erişebilirsiniz.</span>
    </div>
  );
}
