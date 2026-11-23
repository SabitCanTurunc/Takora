"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { aktifIsletmeId } from "@/lib/tenant";

export async function randevuEkle(formData: FormData) {
  const isletmeId = await aktifIsletmeId();

  const baslik = String(formData.get("baslik") || "").trim();
  const musteriAd = String(formData.get("musteri") || "").trim();
  const telefon = String(formData.get("telefon") || "").trim();
  const tarih = String(formData.get("tarih") || "").trim();
  const saat = String(formData.get("saat") || "").trim();

  if (!baslik || !musteriAd || !telefon || !tarih || !saat) {
    return { hata: "Tüm zorunlu alanları doldurun." };
  }

  let musteri = (
    await db.orm.public.Musteri.where({ isletmeId, ad: musteriAd }).all()
  )[0];
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