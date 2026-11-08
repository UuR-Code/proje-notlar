"use client";

import React from "react";
import { ToastProvider } from "./Toast";
import { AppProvider } from "@/context/AppContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { NewProjectModal } from "./NewProjectModal";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { usePathname } from "next/navigation";

function ShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Left Sidebar */}
      <Sidebar className="hidden md:flex shrink-0" />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-24 md:pb-10">
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Modals */}
      <NewProjectModal />
      <GlobalSearchModal />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppProvider>
        <ShellInner>{children}</ShellInner>
      </AppProvider>
    </ToastProvider>
  );
}
