"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface ProjectItem {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  icon?: string | null;
  color?: string | null;
  url?: string | null;
  adminUrl?: string | null;
  priority: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string | null;
  totalNotes: number;
  latestNote?: any;
  tags: string[];
  links?: { id: string; label: string; url: string }[];
}

interface AppContextType {
  projects: ProjectItem[];
  isLoadingProjects: boolean;
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  refreshProjects: () => Promise<void>;
  isNewProjectModalOpen: boolean;
  setIsNewProjectModalOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  noteTrigger: number;
  triggerNoteAdded: () => void;
  currentUser: { id: string; name: string; email: string } | null;
  refreshUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [activeProjectId, setActiveProjectIdState] = useState<string>("");
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [noteTrigger, setNoteTrigger] = useState(0);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      }
    } catch (e) {
      console.error("refreshUser error:", e);
    }
  }, []);

  const refreshProjects = useCallback(async () => {
    try {
      setIsLoadingProjects(true);
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);

        // If no active project selected yet, pick from localStorage or first project
        const stored = localStorage.getItem("pn_last_project_id");
        if (stored && data.some((p: ProjectItem) => p.id === stored)) {
          setActiveProjectIdState(stored);
        } else if (data.length > 0 && !activeProjectId) {
          setActiveProjectIdState(data[0].id);
        }
      }
    } catch (error) {
      console.error("refreshProjects error:", error);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [activeProjectId]);

  const setActiveProjectId = useCallback((id: string) => {
    setActiveProjectIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("pn_last_project_id", id);
    }
  }, []);

  const triggerNoteAdded = useCallback(() => {
    setNoteTrigger((prev) => prev + 1);
    refreshProjects();
  }, [refreshProjects]);

  useEffect(() => {
    refreshUser();
    refreshProjects();
  }, [refreshUser, refreshProjects]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AppContext.Provider
      value={{
        projects,
        isLoadingProjects,
        activeProjectId,
        setActiveProjectId,
        refreshProjects,
        isNewProjectModalOpen,
        setIsNewProjectModalOpen,
        isSearchOpen,
        setIsSearchOpen,
        noteTrigger,
        triggerNoteAdded,
        currentUser,
        refreshUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
