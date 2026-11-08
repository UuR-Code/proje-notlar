"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Folder, FileText, Settings, Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function BottomNav() {
  const pathname = usePathname();
  const { setIsNewProjectModalOpen } = useApp();

  const navItems = [
    { label: "Ana Sayfa", href: "/", icon: Home },
    { label: "Projeler", href: "/projects", icon: Folder },
    { label: "Notlar", href: "/notes", icon: FileText },
    { label: "Ayarlar", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Floating Action Button for Mobile */}
      <div className="fixed right-4 bottom-20 z-40 md:hidden">
        <button
          type="button"
          onClick={() => setIsNewProjectModalOpen(true)}
          className="w-13 h-13 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all"
          title="Yeni Proje Ekle"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2 flex items-center justify-around md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
                isActive ? "text-blue-600 font-semibold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-blue-600 stroke-[2.5]" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
