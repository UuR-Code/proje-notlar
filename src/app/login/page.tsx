"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText, ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const { error, success } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Giriş yapılamadı.");
      }

      success("Giriş başarılı! Yönlendiriliyorsunuz...");
      window.location.href = "/";
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setIsDemoLoading(true);
      const res = await fetch("/api/auth/demo", { method: "POST" });
      if (!res.ok) throw new Error("Demo girişi başarısız.");

      success("Demo hesabına giriş yapıldı!");
      window.location.href = "/";
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-card space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Proje Notları</h1>
          <p className="text-xs text-slate-500">
            Fikirlerini anında kaydet, eksikleri takip et.
          </p>
        </div>

        {/* Demo Fast Login Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isDemoLoading}
          className="w-full flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>{isDemoLoading ? "Giriş Yapılıyor..." : "⚡ Demo Hesabı ile Hızlı Giriş Yap"}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-medium text-slate-400 absolute">
            veya e-posta ile
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              E-posta Adresi
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@alanadi.com"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Şifre
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs shadow-blue-500/20 transition-all"
          >
            <span>{isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Hesabınız yok mu?{" "}
          <Link href="/register" className="font-semibold text-blue-600 hover:underline">
            Yeni Hesap Oluştur
          </Link>
        </div>
      </div>
    </div>
  );
}
