import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Türk para formatı: 1500 → "₺1.500,00" */
export function formatPara(miktar: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(miktar);
}

/** Türk tarih formatı: Date → "20 Kasım 2026" */
export function formatTarih(tarih: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(tarih));
}

/** Türk tarih + saat: "20 Kasım 2026, 14:30" */
export function formatTarihSaat(tarih: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(tarih));
}

/** Türk telefon formatı: "5551234567" → "0555 123 45 67" */
export function formatTelefon(tel: string): string {
  const temiz = tel.replace(/\D/g, "").replace(/^90/, "");
  if (temiz.length !== 10) return tel;
  return `0${temiz.slice(0, 3)} ${temiz.slice(3, 6)} ${temiz.slice(6, 8)} ${temiz.slice(8)}`;
}

/** Slug üretici */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
