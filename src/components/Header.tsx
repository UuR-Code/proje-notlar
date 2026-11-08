"use client";

import React, { useState } from "react";
import { Search, Bell, Menu, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { Sidebar } from "./Sidebar";

export function Header() {
  const { setIsSearchOpen, currentUser } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
        {/* Mobile menu hamburger & brand */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="font-bold text-sm text-slate-800">
            Proje Notları
          </Link>
        </div>

        {/* Global Search Bar (opens Ctrl+K modal on click or key) */}
        <div className="flex-1 max-w-md">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-400 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              <span>Proje veya not ara...</span>
            </div>
            <kbd className="hidden sm:inline-block text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
              ⌘ K
            </kbd>
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Notifications button */}
          <button
            type="button"
            className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            title="Bildirimler"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* User Avatar */}
          <Link
            href="/settings"
            className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs hover:ring-2 hover:ring-blue-400 transition-all"
            title={currentUser?.name || "Kullanıcı"}
          >
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "K"}
          </Link>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-xs bg-white shadow-xl z-50 h-full animate-in slide-in-from-left">
            <div className="absolute top-4 right-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
