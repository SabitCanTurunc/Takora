"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { aktifIsletmeId, yetkiKontrol } from "@/lib/tenant";

export async function musteriEkle(formData: FormData) {
  await yetkiKontrol("CALISAN");
  const isletmeId = await aktifIsletmeId();

  const adSoyad = String(formData.get("adSoyad") || "").trim();
  const telefon = String(formData.get("telefon") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const notlar = String(formData.get("notlar") || "").trim();

  if (!adSoyad || !telefon) {
    return { hata: "Ad soyad ve telefon zorunludur." };
  }

  const temizTel = telefon.replace(/\D/g, "");
  const mevcutlar = await db.orm.public.Musteri.where({ isletmeId }).all();
  const mevcut = mevcutlar.find(
    (m) => m.telefon && m.telefon.replace(/\D/g, "") === temizTel
  );
  if (mevcut) {
    return { hata: "Bu telefon numarası zaten kayıtlı." };
  }

  await db.orm.public.Musteri.create({
    isletmeId,
    ad: adSoyad,
    telefon,
    email: email || null,
    notlar: notlar || null,
  });

  revalidatePath("/musteriler");
  revalidatePath("/dashboard");
  return null;
}