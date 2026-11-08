import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format relative time in Turkish (e.g., "şimdi", "5 dk önce", "Bugün 14:30", "Dün", "12 Eki")
 */
export function formatTurkishRelativeTime(dateInput: Date | string | number): string {
  const date = typeof dateInput === "object" ? dateInput : new Date(dateInput);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSec = Math.floor(diffInMs / 1000);
  const diffInMin = Math.floor(diffInSec / 60);
  const diffInHours = Math.floor(diffInMin / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSec < 60) {
    return "az önce";
  }
  if (diffInMin < 60) {
    return `${diffInMin} dk önce`;
  }

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeStr = date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

  if (isToday) {
    return `Bugün ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Dün ${timeStr}`;
  }

  if (diffInDays < 7) {
    return `${diffInDays} gün önce`;
  }

  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: now.getFullYear() === date.getFullYear() ? undefined : "numeric",
  });
}

/**
 * Case-insensitive Turkish search matcher
 */
export function turkishMatches(source: string | null | undefined, query: string): boolean {
  if (!source) return false;
  if (!query) return true;
  return source.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR"));
}

export type NoteCategory = "general" | "idea" | "issue" | "bug" | "improvement";
export type NoteStatus = "open" | "in_progress" | "completed";
export type NotePriority = "low" | "normal" | "high";

export const CATEGORIES: {
  id: NoteCategory;
  label: string;
  iconName: string;
  colorClass: string;
  badgeBg: string;
}[] = [
  {
    id: "general",
    label: "Genel Not",
    iconName: "FileText",
    colorClass: "text-slate-600",
    badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
  },
  {
    id: "idea",
    label: "Yeni Fikir",
    iconName: "Lightbulb",
    colorClass: "text-amber-500",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "issue",
    label: "Eksik",
    iconName: "AlertTriangle",
    colorClass: "text-rose-500",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    id: "bug",
    label: "Hata",
    iconName: "Bug",
    colorClass: "text-red-600",
    badgeBg: "bg-red-50 text-red-700 border-red-200",
  },
  {
    id: "improvement",
    label: "İyileştirme",
    iconName: "Sparkles",
    colorClass: "text-blue-600",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
  },
];

export const PRIORITIES: {
  id: NotePriority;
  label: string;
  colorClass: string;
  badgeBg: string;
}[] = [
  { id: "low", label: "Düşük", colorClass: "text-slate-500", badgeBg: "bg-slate-100 text-slate-700" },
  { id: "normal", label: "Normal", colorClass: "text-blue-600", badgeBg: "bg-blue-50 text-blue-700" },
  { id: "high", label: "Yüksek", colorClass: "text-red-600", badgeBg: "bg-red-50 text-red-700" },
];

export const PROJECT_STATUSES: {
  id: string;
  label: string;
  badgeClass: string;
}[] = [
  { id: "active", label: "Aktif", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "pending", label: "Beklemede", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "completed", label: "Tamamlandı", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "archived", label: "Arşivlendi", badgeClass: "bg-slate-100 text-slate-600 border-slate-200" },
];
