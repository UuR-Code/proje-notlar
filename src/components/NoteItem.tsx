"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Lightbulb,
  AlertTriangle,
  Bug,
  Sparkles,
  FileText,
  Pin,
  Trash2,
  Edit2,
  FolderSync,
} from "lucide-react";
import { formatTurkishRelativeTime, CATEGORIES } from "@/lib/utils";
import { ProjectIcon } from "./ProjectIcon";
import { useToast } from "./Toast";
import { useApp } from "@/context/AppContext";

export interface NoteItemData {
  id: string;
  projectId: string;
  content: string;
  category: string;
  status: string;
  priority: string;
  isPinned: boolean;
  createdAt: string | Date;
  project?: {
    id: string;
    name: string;
    color?: string | null;
    icon?: string | null;
  };
}

interface NoteItemProps {
  note: NoteItemData;
  showProjectBadge?: boolean;
  onEdit?: (note: NoteItemData) => void;
  onRefresh?: () => void;
}

export function NoteItem({
  note,
  showProjectBadge = true,
  onEdit,
  onRefresh,
}: NoteItemProps) {
  const { success, error, toast } = useToast();
  const { projects, triggerNoteAdded } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isCompleted = note.status === "completed";
  const categoryInfo = CATEGORIES.find((c) => c.id === note.category) || CATEGORIES[0];

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
        setIsMoving(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleStatus = async () => {
    const newStatus = isCompleted ? "open" : "completed";
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Durum güncellenemedi");

      success(newStatus === "completed" ? "Not tamamlandı!" : "Not yeniden açıldı.");
      if (onRefresh) onRefresh();
      triggerNoteAdded();
    } catch (e: any) {
      error(e.message);
    }
  };

  const togglePin = async () => {
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      });
      if (!res.ok) throw new Error("Sabitleme değiştirilemedi");

      success(note.isPinned ? "Sabitleme kaldırıldı." : "Not başa sabitlendi.");
      setIsMenuOpen(false);
      if (onRefresh) onRefresh();
      triggerNoteAdded();
    } catch (e: any) {
      error(e.message);
    }
  };

  const moveToProject = async (targetProjectId: string) => {
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: targetProjectId }),
      });
      if (!res.ok) throw new Error("Proje değiştirilemedi");

      const targetProj = projects.find((p) => p.id === targetProjectId);
      success(`Not "${targetProj?.name || "projeye"}" taşındı.`);
      setIsMenuOpen(false);
      setIsMoving(false);
      if (onRefresh) onRefresh();
      triggerNoteAdded();
    } catch (e: any) {
      error(e.message);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Not silinemedi");

      // Soft delete toast with instant undo!
      toast("Not çöp kutusuna taşındı", "info", {
        label: "Geri Al",
        onClick: async () => {
          await fetch(`/api/notes/${note.id}/restore`, { method: "POST" });
          success("Not geri yüklendi!");
          if (onRefresh) onRefresh();
          triggerNoteAdded();
        },
      });

      setIsMenuOpen(false);
      if (onRefresh) onRefresh();
      triggerNoteAdded();
    } catch (e: any) {
      error(e.message);
    }
  };

  const renderCategoryIcon = (catId: string) => {
    switch (catId) {
      case "idea":
        return <Lightbulb className="w-3.5 h-3.5 text-amber-500" />;
      case "issue":
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />;
      case "bug":
        return <Bug className="w-3.5 h-3.5 text-red-600" />;
      case "improvement":
        return <Sparkles className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div
      className={`group relative flex items-start gap-3 p-3.5 md:p-4 rounded-xl border transition-all ${
        isCompleted
          ? "bg-slate-50/70 border-slate-200/60 opacity-75"
          : note.isPinned
          ? "bg-amber-50/20 border-amber-200/80 shadow-xs"
          : "bg-white border-slate-200/80 hover:border-slate-300 shadow-card hover:shadow-elevated"
      }`}
    >
      {/* Complete toggle checkbox */}
      <button
        type="button"
        onClick={toggleStatus}
        className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
        title={isCompleted ? "Tamamlanmadı olarak işaretle" : "Tamamla"}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
        ) : (
          <Circle className="w-5 h-5 text-slate-300 hover:text-emerald-500" />
        )}
      </button>

      {/* Main Body */}
      <div className="flex-1 min-w-0 pr-6">
        {/* Content text */}
        <p
          onClick={() => onEdit && onEdit(note)}
          className={`text-sm md:text-base leading-snug cursor-pointer select-text ${
            isCompleted ? "line-through text-slate-400" : "text-slate-800"
          }`}
        >
          {note.content}
        </p>

        {/* Badges and timestamp row */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {/* Category badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${categoryInfo.badgeBg}`}
          >
            {renderCategoryIcon(note.category)}
            <span>{categoryInfo.label}</span>
          </span>

          {/* Project badge if applicable */}
          {showProjectBadge && note.project && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <ProjectIcon
                name={note.project.name}
                icon={note.project.icon}
                color={note.project.color}
                size="sm"
                className="w-3.5 h-3.5 text-[9px]"
              />
              <span className="truncate max-w-[120px]">{note.project.name}</span>
            </div>
          )}

          {/* High Priority badge */}
          {note.priority === "high" && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700">
              🔥 Yüksek
            </span>
          )}

          {/* Pinned indicator */}
          {note.isPinned && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-amber-600 font-medium">
              <Pin className="w-3 h-3 fill-amber-500 text-amber-500 rotate-45" />
              <span>Sabit</span>
            </span>
          )}

          {/* Relative Time */}
          <span className="text-[11px] text-slate-400">
            {formatTurkishRelativeTime(note.createdAt)}
          </span>
        </div>
      </div>

      {/* Action Menu (triple dots) */}
      <div className="absolute top-3.5 right-3" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1.5 text-xs animate-in fade-in-50">
            <button
              type="button"
              onClick={toggleStatus}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{isCompleted ? "Yeniden Aç" : "Tamamlandı İşaretle"}</span>
            </button>

            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onEdit(note);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Düzenle</span>
              </button>
            )}

            <button
              type="button"
              onClick={togglePin}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Pin className="w-3.5 h-3.5 text-slate-400" />
              <span>{note.isPinned ? "Sabitlemeyi Kaldır" : "Başa Sabitle"}</span>
            </button>

            {/* Move to another project */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMoving(!isMoving)}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FolderSync className="w-3.5 h-3.5 text-slate-400" />
                  <span>Projeye Taşı</span>
                </div>
                <span className="text-[10px] text-slate-400">▶</span>
              </button>

              {isMoving && (
                <div className="bg-slate-50 border-y border-slate-200 py-1 max-h-36 overflow-y-auto">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => moveToProject(p.id)}
                      className={`w-full text-left px-4 py-1.5 text-xs truncate hover:bg-blue-50 hover:text-blue-700 ${
                        p.id === note.projectId ? "font-semibold text-blue-600" : "text-slate-600"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 my-1" />

            <button
              type="button"
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-rose-600 hover:bg-rose-50 transition-colors font-medium"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Çöp Kutusuna Sil</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
