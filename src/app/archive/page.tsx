"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Archive, RotateCcw, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ProjectIcon } from "@/components/ProjectIcon";
import { useToast } from "@/components/Toast";

export default function ArchivePage() {
  const { refreshProjects } = useApp();
  const { success, error } = useToast();
  const [archivedProjects, setArchivedProjects] = useState<any[]>([]);
  const [completedNotes, setCompletedNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<"projects" | "notes">("projects");

  const fetchArchive = useCallback(async () => {
    try {
      setIsLoading(true);
      const [projRes, notesRes] = await Promise.all([
        fetch("/api/projects?status=archived"),
        fetch("/api/notes?status=completed&limit=50"),
      ]);

      if (projRes.ok) {
        setArchivedProjects(await projRes.json());
      }
      if (notesRes.ok) {
        setCompletedNotes(await notesRes.json());
      }
    } catch (err) {
      console.error("fetchArchive error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArchive();
  }, [fetchArchive]);

  const handleUnarchiveProject = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      if (!res.ok) throw new Error("Proje arşivden çıkarılamadı.");

      success("Proje yeniden aktif hale getirildi.");
      await refreshProjects();
      fetchArchive();
    } catch (err: any) {
      error(err.message);
    }
  };

  const handleReopenNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "open" }),
      });
      if (!res.ok) throw new Error("Not yeniden açılamadı.");

      success("Not yeniden açıldı.");
      fetchArchive();
    } catch (err: any) {
      error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Archive className="w-5 h-5 text-slate-500" />
            <span>Arşiv</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Arşivlenmiş projelerin ve tamamlanmış notların geçmiş kaydı.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setTab("projects")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              tab === "projects" ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Arşiv Projeler ({archivedProjects.length})
          </button>
          <button
            onClick={() => setTab("notes")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              tab === "notes" ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Tamamlanan Notlar ({completedNotes.length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-2xl">
          Arşiv kayıtları yükleniyor...
        </div>
      ) : tab === "projects" ? (
        <div className="space-y-3">
          {archivedProjects.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
              <p className="text-sm font-semibold text-slate-700">Arşivlenmiş proje yok</p>
              <p className="text-xs text-slate-400 mt-1">
                Aktif olmayan veya biten projeleri detay sayfasından arşivleyebilirsiniz.
              </p>
            </div>
          ) : (
            archivedProjects.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <ProjectIcon name={p.name} icon={p.icon} color="#94a3b8" size="md" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-700">{p.name}</h3>
                    <p className="text-xs text-slate-400">{p.totalNotes} not kaydedildi</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleUnarchiveProject(p.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Arşivden Çıkar</span>
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {completedNotes.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
              <p className="text-sm font-semibold text-slate-700">Tamamlanan not yok</p>
              <p className="text-xs text-slate-400 mt-1">
                Notları solundaki onay kutusuna basarak tamamlayabilirsiniz.
              </p>
            </div>
          ) : (
            completedNotes.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl"
              >
                <div className="flex items-center gap-3 truncate pr-4">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs md:text-sm text-slate-500 line-through truncate">
                      {n.content}
                    </p>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {n.project?.name}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleReopenNote(n.id)}
                  className="text-xs font-medium text-slate-500 hover:text-blue-600 shrink-0"
                >
                  Yeniden Aç
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
