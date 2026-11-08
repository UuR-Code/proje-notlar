"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, FileText, ArrowRight, Lightbulb, AlertTriangle, Bug, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { ProjectIcon } from "./ProjectIcon";
import { CATEGORIES } from "@/lib/utils";

export function GlobalSearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useApp();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ projects: any[]; notes: any[] }>({
    projects: [],
    notes: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults({ projects: [], notes: [] });
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ projects: [], notes: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  const navigateToProject = (id: string) => {
    setIsSearchOpen(false);
    router.push(`/projects/${id}`);
  };

  const navigateToNote = (projectId: string, noteId: string) => {
    setIsSearchOpen(false);
    router.push(`/projects/${projectId}#note-${noteId}`);
  };

  const renderCategoryIcon = (category: string) => {
    switch (category) {
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

  const hasResults = results.projects.length > 0 || results.notes.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-modal max-w-xl w-full overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Proje veya not ara... (Türkçe karakter duyarlı)"
            className="flex-1 text-sm md:text-base text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[11px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Aranıyor...</div>
          ) : query.trim() && !hasResults ? (
            <div className="p-8 text-center text-sm text-slate-500">
              &ldquo;{query}&rdquo; ile eşleşen bir proje veya not bulunamadı.
            </div>
          ) : !query.trim() ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Aramak istediğiniz proje adını veya not metnini yazın.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Projects Group */}
              {results.projects.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Projeler ({results.projects.length})
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.projects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => navigateToProject(p.id)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <ProjectIcon name={p.name} icon={p.icon} color={p.color} size="sm" />
                          <div className="truncate">
                            <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                            {p.description && (
                              <p className="text-xs text-slate-400 truncate">{p.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                          <span>{p.totalNotes} not</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Group */}
              {results.notes.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Notlar ({results.notes.length})
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.notes.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => navigateToNote(n.projectId, n.id)}
                        className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">{renderCategoryIcon(n.category)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm text-slate-800 line-clamp-2">
                              {n.content}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-medium text-slate-500">
                                {n.project?.name}
                              </span>
                              <span className="text-[10px] text-slate-400">•</span>
                              <span className="text-[11px] text-slate-400">
                                {CATEGORIES.find((c) => c.id === n.category)?.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
