"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { aktifIsletmeId, yetkiKontrol } from "@/lib/tenant";

export async function randevuEkle(formData: FormData) {
  await yetkiKontrol("CALISAN");
  const isletmeId = await aktifIsletmeId();

  const baslik = String(formData.get("baslik") || "").trim();
  const musteriAd = String(formData.get("musteri") || "").trim();
  const telefon = String(formData.get("telefon") || "").trim();
  const tarih = String(formData.get("tarih") || "").trim();
  const saat = String(formData.get("saat") || "").trim();

  if (!baslik || !musteriAd || !telefon || !tarih || !saat) {
    return { hata: "Tüm zorunlu alanları doldurun." };
  }

  const musteriler = await db.orm.public.Musteri.where({ isletmeId }).all();
  let musteri = telefon
    ? musteriler.find((m) => m.telefon && m.telefon.replace(/\D/g, "") === telefon.replace(/\D/g, ""))
    : musteriler.find((m) => m.ad === musteriAd);

  if (!musteri) {
    musteri = await db.orm.public.Musteri.create({
      isletmeId,
      ad: musteriAd,
      telefon,
    });
  }

  const tarihSaat = new Date(`${tarih}T${saat}:00`);

  await db.orm.public.Randevu.create({
    isletmeId,
    musteriId: musteri.id,
    baslik,
    tarih: tarihSaat,
    sure: 60,
    durum: "ONAYLANDI",
  });

  revalidatePath("/randevular");
  revalidatePath("/musteriler");
  return null;
}