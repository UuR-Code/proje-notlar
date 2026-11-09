"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Search, Folder, ChevronRight, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/Toast";
import { ProjectIcon } from "@/components/ProjectIcon";
import { formatTurkishRelativeTime, PROJECT_STATUSES } from "@/lib/utils";

export default function ProjectsListPage() {
  const { projects, setIsNewProjectModalOpen, refreshProjects } = useApp();
  const { success, error } = useToast();
  const [search, setSearch] = useState("");

  const filteredProjects = projects.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-600" />
            <span>Projelerim ({projects.length})</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Üzerinde çalıştığın tüm web siteleri, yazılımlar ve SaaS projeleri.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewProjectModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-semibold rounded-xl shadow-xs shadow-blue-500/20 active:scale-98 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Yeni Proje</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Projelerde ara..."
          className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((p) => {
          const statusInfo = PROJECT_STATUSES.find((s) => s.id === p.status) || PROJECT_STATUSES[0];
          return (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-card hover:shadow-elevated hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ProjectIcon name={p.name} icon={p.icon} color={p.color} size="lg" />
                    <div>
                      <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {p.name}
                      </h3>
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold border mt-0.5 ${statusInfo.badgeClass}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (window.confirm(`"${p.name}" projesini ve projeye ait TÜM NOTLARI kalıcı olarak silmek istediğinize emin misiniz?`)) {
                          try {
                            const res = await fetch(`/api/projects/${p.id}`, { method: "DELETE" });
                            if (!res.ok) throw new Error("Silinemedi");
                            success(`"${p.name}" projesi kalıcı olarak silindi.`);
                            await refreshProjects();
                          } catch {
                            error("Proje silinirken hata oluştu.");
                          }
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Projeyi Kalıcı Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {p.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mt-3">
                    {p.description}
                  </p>
                )}

                {/* Tags */}
                {p.tags && p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-100"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-600">{p.totalNotes} kayıtlı not</span>
                <span>{formatTurkishRelativeTime(p.lastOpenedAt || p.updatedAt)}</span>
              </div>
            </Link>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white border border-slate-200 rounded-2xl">
            <p className="text-sm font-semibold text-slate-700">Proje bulunamadı</p>
            <p className="text-xs text-slate-400 mt-1">
              Arama kriterinize uygun proje yok veya henüz proje eklenmedi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
