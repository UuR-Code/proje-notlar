"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, ChevronDown, Lightbulb, AlertTriangle, Bug, Sparkles, FileText, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useToast } from "./Toast";
import { ProjectIcon } from "./ProjectIcon";
import { CATEGORIES, NoteCategory } from "@/lib/utils";

interface QuickNoteCardProps {
  lockedProjectId?: string;
  defaultCategory?: NoteCategory;
  compact?: boolean;
  onNoteAdded?: () => void;
}

export function QuickNoteCard({
  lockedProjectId,
  defaultCategory = "general",
  compact = false,
  onNoteAdded,
}: QuickNoteCardProps) {
  const { projects, activeProjectId, setActiveProjectId, triggerNoteAdded } = useApp();
  const { success, error } = useToast();

  const selectedProjectId = lockedProjectId || activeProjectId || (projects[0]?.id ?? "");
  const currentProject = projects.find((p) => p.id === selectedProjectId);

  const [content, setContent] = useState("");
  const [category, setCategory] = useState<NoteCategory>(defaultCategory);
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Restore draft from localStorage when project changes
  useEffect(() => {
    if (typeof window !== "undefined" && selectedProjectId) {
      const draftKey = `pn_draft_${selectedProjectId}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        setContent(savedDraft);
      } else {
        setContent("");
      }
    }
  }, [selectedProjectId]);

  // Save draft to localStorage on content change
  const handleContentChange = (val: string) => {
    setContent(val);
    if (typeof window !== "undefined" && selectedProjectId) {
      const draftKey = `pn_draft_${selectedProjectId}`;
      if (val.trim()) {
        localStorage.setItem(draftKey, val);
      } else {
        localStorage.removeItem(draftKey);
      }
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    if (!selectedProjectId) {
      error("Lütfen önce bir proje seçin veya oluşturun.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          content: content.trim(),
          category,
          priority,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Not kaydedilemedi");
      }

      // Clear draft & input
      if (typeof window !== "undefined") {
        localStorage.removeItem(`pn_draft_${selectedProjectId}`);
      }
      setContent("");
      success("Not anında kaydedildi!");

      triggerNoteAdded();
      if (onNoteAdded) onNoteAdded();

      // Keep focus on textarea for rapid consecutive notes
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    } catch (err: any) {
      error(err.message || "Kaydetme başarısız oldu. Yazdığınız not korundu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const categoryIcons: Record<NoteCategory, React.ReactNode> = {
    idea: <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />,
    issue: <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />,
    bug: <Bug className="w-4 h-4 text-red-500 shrink-0" />,
    improvement: <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />,
    general: <FileText className="w-4 h-4 text-slate-500 shrink-0" />,
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 shadow-card hover:border-slate-300 transition-all">
      {/* Top Header: Title & Project Selector */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-50 text-blue-600 font-bold text-xs">
            ⚡
          </span>
          <h2 className="font-semibold text-slate-800 text-sm md:text-base">
            {compact ? "Hızlı Not" : "Hızlı Not Ekle"}
          </h2>
        </div>

        {/* Project Selector (only show if not locked to a specific project) */}
        {!lockedProjectId && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs md:text-sm font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-colors"
            >
              <span className="text-slate-400">Proje:</span>
              {currentProject ? (
                <div className="flex items-center gap-1.5 max-w-[150px] truncate">
                  <ProjectIcon
                    name={currentProject.name}
                    icon={currentProject.icon}
                    color={currentProject.color}
                    size="sm"
                  />
                  <span className="truncate font-medium">{currentProject.name}</span>
                </div>
              ) : (
                <span className="text-slate-500">Proje Seçin</span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1.5 animate-in fade-in-50">
                <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Projelerim
                </div>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setActiveProjectId(p.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs md:text-sm text-left hover:bg-slate-50 transition-colors ${
                      p.id === selectedProjectId ? "bg-blue-50/70 text-blue-700 font-medium" : "text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ProjectIcon name={p.name} icon={p.icon} color={p.color} size="sm" />
                      <span className="truncate">{p.name}</span>
                    </div>
                    {p.id === selectedProjectId && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Aklına gelen fikri, eksikliği veya iyileştirmeyi hemen yaz..."
          rows={compact ? 2 : 3}
          className="w-full resize-none p-3 text-sm md:text-base text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-white focus:bg-white"
        />
      </div>

      {/* Bottom Bar: Category Pills & Submit Button */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mt-3 pt-1">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? `${cat.badgeBg} ring-1 ring-offset-0 ring-slate-300 font-semibold shadow-xs`
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {categoryIcons[cat.id]}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls: Priority & Save */}
        <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-end">
          {/* Priority Pill Picker */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="low">Düşük Öncelik</option>
            <option value="normal">Normal Öncelik</option>
            <option value="high">🔥 Yüksek Öncelik</option>
          </select>

          {/* Submit Button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!content.trim() || isSubmitting}
            className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl text-xs md:text-sm font-semibold transition-all ${
              content.trim() && !isSubmitting
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 active:scale-98"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Notu Kaydet</span>
            <kbd className="hidden sm:inline-block ml-1 text-[10px] font-normal opacity-70 bg-white/20 px-1 rounded">
              ⌘ Enter
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
}
