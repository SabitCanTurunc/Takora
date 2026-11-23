"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { aktifIsletmeId } from "@/lib/tenant";

export async function musteriEkle(formData: FormData) {
  const isletmeId = await aktifIsletmeId();

  const adSoyad = String(formData.get("adSoyad") || "").trim();
  const telefon = String(formData.get("telefon") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const notlar = String(formData.get("notlar") || "").trim();

  if (!adSoyad || !telefon) {
    return { hata: "Ad soyad ve telefon zorunludur." };
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