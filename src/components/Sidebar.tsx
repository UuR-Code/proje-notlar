"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Folder,
  FileText,
  AlertTriangle,
  Lightbulb,
  Clock,
  Archive,
  Trash2,
  Plus,
  Settings,
  LogOut,
  Download,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ProjectIcon } from "./ProjectIcon";
import { useToast } from "./Toast";
import { usePWA } from "@/hooks/usePWA";

interface SidebarProps {
  className?: string;
  onCloseMobile?: () => void;
}

export function Sidebar({ className = "", onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { projects, setIsNewProjectModalOpen, currentUser } = useApp();
  const { success } = useToast();
  const { isInstallable, isInstalled, installApp } = usePWA();

  const navItems = [
    { label: "Projeler & Notlar", href: "/", icon: Folder },
    { label: "Tüm Notlar", href: "/notes", icon: FileText },
    { label: "Eksikler / İyileştirmeler", href: "/issues", icon: AlertTriangle },
    { label: "Yeni Fikirler", href: "/ideas", icon: Lightbulb },
    { label: "Takip Listesi", href: "/tracking", icon: Clock },
    { label: "Arşiv", href: "/archive", icon: Archive },
    { label: "Çöp Kutusu", href: "/trash", icon: Trash2 },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    success("Başarıyla çıkış yapıldı.");
    window.location.href = "/login";
  };

  return (
    <aside
      className={`w-64 bg-white border-r border-slate-200/80 flex flex-col h-full select-none ${className}`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600 text-white shadow-xs">
          <FileText className="w-4 h-4" />
        </div>
        <Link href="/" className="font-bold text-base text-slate-800 tracking-tight">
          Proje Notları
        </Link>
      </div>

      {/* Main Nav Items */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Projects Sub-section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Projelerim ({projects.length})
            </span>
          </div>

          {/* "+ Yeni Proje" Button */}
          <button
            type="button"
            onClick={() => {
              setIsNewProjectModalOpen(true);
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all mb-3 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yeni Proje</span>
          </button>

          {/* Project List */}
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {projects.map((p) => {
              const isCurrentProject = pathname === `/projects/${p.id}`;
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                    isCurrentProject
                      ? "bg-blue-50/80 text-blue-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <ProjectIcon name={p.name} icon={p.icon} color={p.color} size="sm" />
                    <span className="truncate">{p.name}</span>
                  </div>
                  {p.totalNotes > 0 && (
                    <span className="text-[11px] text-slate-400 group-hover:text-slate-600 font-normal">
                      {p.totalNotes}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* PWA Install Button */}
      {!isInstalled && isInstallable && (
        <div className="px-4 py-2 border-t border-slate-100">
          <button
            type="button"
            onClick={installApp}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Uygulamayı Yükle</span>
          </button>
        </div>
      )}

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          href="/settings"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 truncate flex-1 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "K"}
          </div>
          <div className="truncate text-left">
            <div className="text-xs font-semibold text-slate-800 truncate">
              {currentUser?.name || "Kullanıcı"}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {currentUser?.email || "Hesap Ayarları"}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/settings"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Ayarlar"
          >
            <Settings className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Çıkış Yap"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
